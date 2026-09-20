import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { AppState, type AppStateStatus } from 'react-native';

import { AiError, BUILD_TIME_KEY, canUseAi, writeReadings } from '@/lib/ai';
import {
  cancelScheduled,
  configureNotificationHandler,
  ensurePermission,
  notificationsSupported,
  Notifications,
  permissionState,
  predictionIdOf,
  presentNow,
  syncSchedule,
  type PermissionState,
} from '@/lib/notifications';
import { formatBirthMoment } from '@/lib/kundli';
import {
  buildPrediction,
  composePrediction,
  currentSlot,
  factsFor,
  predictionId,
  profileSignature,
  upcomingSlots,
  type Prediction,
  type PredictionFacts,
} from '@/lib/predictions';
import { useOnboarding } from '@/store/onboarding';

/** How many windows past the current one are written and queued in advance. */
const HORIZON = 4;

/** Readings kept after they have been delivered, so the list has a history. */
const KEEP = 24;

/** A foreground that arrives sooner than this does not re-run the writing. */
const REFRESH_INTERVAL_MS = 10 * 60_000;

const STORAGE_KEY = 'astronepali.predictions.v1';

export type PredictionSettings = {
  /** Whether the five-hourly notification is on at all. */
  enabled: boolean;
  /** Adds the 01:00 reading to the four daytime ones. */
  overnight: boolean;
  /** Anthropic key, typed in by whoever runs the app. May be empty. */
  apiKey: string;
};

const defaultSettings: PredictionSettings = {
  enabled: true,
  overnight: false,
  apiKey: '',
};

type StoredState = {
  settings: PredictionSettings;
  predictions: Prediction[];
  /** Whose chart these were written for. */
  signature: string;
};

type PredictionsContextValue = {
  hydrated: boolean;
  settings: PredictionSettings;
  /** Newest first, delivered and upcoming together. */
  predictions: Prediction[];
  /** The reading for the window the person is in right now. */
  current: Prediction | null;
  /** The ones that have not arrived yet, soonest first. */
  upcoming: Prediction[];
  /** True while readings are being written. */
  working: boolean;
  /** Set when the AI could not be reached; the device wrote them instead. */
  aiError: string | null;
  /** True when there is a key (or a proxy) to write with. */
  aiReady: boolean;
  permission: PermissionState;
  /** How many notifications the system currently holds for us. */
  scheduled: number;
  setEnabled: (enabled: boolean) => void;
  setOvernight: (overnight: boolean) => void;
  setApiKey: (key: string) => void;
  refresh: (options?: { rewrite?: boolean }) => Promise<void>;
  markRead: (id: string) => void;
  findPrediction: (id: string) => Prediction | undefined;
  /** Delivers the current reading straight away, to prove the plumbing works. */
  sendTest: () => Promise<boolean>;
};

const PredictionsContext = createContext<PredictionsContextValue | null>(null);

configureNotificationHandler();

export function PredictionsProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { profile, hydrated: profileHydrated } = useOnboarding();

  const [settings, setSettings] = useState<PredictionSettings>(defaultSettings);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [working, setWorking] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [permission, setPermission] = useState<PermissionState>(
    notificationsSupported ? 'denied' : 'unsupported',
  );
  const [scheduled, setScheduled] = useState(0);

  /** Guards against two refreshes overlapping — one writes, the other waits. */
  const running = useRef(false);
  const lastRefresh = useRef(0);
  /** The latest state, readable from inside a callback that is not re-created. */
  const latest = useRef({ settings, predictions, profile });
  latest.current = { settings, predictions, profile };

  const signature = useMemo(() => profileSignature(profile), [profile]);
  const apiKey = settings.apiKey.trim() || BUILD_TIME_KEY;
  const aiReady = canUseAi(apiKey);

  /* ---------------------------------------------------------------- *
   * Storage
   * ---------------------------------------------------------------- */

  useEffect(() => {
    // Nothing is read back until the birth details are: the stored readings
    // are kept under a signature of those details, and comparing against the
    // defaults would throw away a perfectly good day of readings on launch.
    if (!profileHydrated) return;

    let cancelled = false;

    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (cancelled || !raw) return;
        const stored = JSON.parse(raw) as Partial<StoredState>;
        if (stored.settings) {
          setSettings({ ...defaultSettings, ...stored.settings });
        }
        // Readings written for a different set of birth details belong to a
        // different person; a logout or an edited birth time drops them.
        if (
          Array.isArray(stored.predictions) &&
          stored.signature === profileSignature(latest.current.profile)
        ) {
          setPredictions(stored.predictions);
        }
      })
      .catch(() => {
        // A failed read just means today's readings get written again.
      })
      .finally(() => {
        if (!cancelled) setHydrated(true);
      });

    return () => {
      cancelled = true;
    };
  }, [profileHydrated]);

  const persist = useCallback(
    (next: { settings: PredictionSettings; predictions: Prediction[] }) => {
      const payload: StoredState = { ...next, signature };
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(payload)).catch(() => {
        // Best effort; the session still works in memory.
      });
    },
    [signature],
  );

  /**
   * A logout, or an edited birth time, makes every stored reading somebody
   * else's. They go, and so does anything already queued with the system.
   */
  const knownSignature = useRef<string | null>(null);
  useEffect(() => {
    if (!hydrated) return;
    if (knownSignature.current === null) {
      knownSignature.current = signature;
      return;
    }
    if (knownSignature.current === signature) return;
    knownSignature.current = signature;

    setPredictions([]);
    // The refresh below runs in this same commit and reads the mirror rather
    // than the state, so the mirror has to be emptied here too.
    latest.current.predictions = [];
    persist({ settings: latest.current.settings, predictions: [] });
    void cancelScheduled().then(() => setScheduled(0));
  }, [hydrated, signature, persist]);

  /* ---------------------------------------------------------------- *
   * Writing the readings
   * ---------------------------------------------------------------- */

  const refresh = useCallback(
    async ({ rewrite = false }: { rewrite?: boolean } = {}) => {
      if (running.current) return;

      const { settings: current, predictions: existing, profile: who } = latest.current;
      if (!who.birthDate) return;

      running.current = true;
      setWorking(true);

      try {
        const now = new Date();
        const slots = [
          currentSlot(now, current.overnight),
          ...upcomingSlots(now, HORIZON, current.overnight),
        ];

        const byId = new Map(existing.map((prediction) => [prediction.id, prediction]));
        const facts = slots
          .map((at) => factsFor(who, at))
          .filter((entry): entry is PredictionFacts => entry !== null);

        const key = current.apiKey.trim() || BUILD_TIME_KEY;
        const useAi = canUseAi(key);

        // A window is written again when it has no reading, when the person
        // asked for a rewrite, or when the device wrote it and an AI is now
        // available to do it better.
        const pending = facts.filter((entry) => {
          const held = byId.get(predictionId(entry.at));
          if (!held || rewrite) return true;
          return useAi && held.source === 'device';
        });

        let written: Prediction[] = [];

        if (pending.length) {
          let aiText = new Map<string, ReturnType<typeof composePrediction>>();

          if (useAi) {
            try {
              aiText = await writeReadings(
                key,
                {
                  firstName: who.name.trim().split(/\s+/)[0] ?? '',
                  gender: who.gender ?? 'not given',
                  birthDetails: formatBirthMoment(pending[0].kundli.moment),
                  birthPlace: who.birthPlace.trim() || 'Kathmandu, Nepal',
                  language: who.languages[0] ?? 'English',
                },
                pending,
              );
              setAiError(null);
            } catch (error) {
              // The reading still goes out — the device writes it instead.
              setAiError(error instanceof AiError ? error.message : 'The AI could not be reached.');
            }
          } else {
            setAiError(null);
          }

          written = pending.map((entry) => {
            const fromAi = aiText.get(predictionId(entry.at));
            return buildPrediction(
              entry,
              fromAi ?? composePrediction(entry),
              fromAi ? 'ai' : 'device',
            );
          });
        }

        const merged = [...byId.values()]
          .filter((prediction) => !written.some((fresh) => fresh.id === prediction.id))
          .concat(written)
          .sort((a, b) => b.at - a.at)
          .slice(0, KEEP);

        setPredictions(merged);
        latest.current.predictions = merged;
        persist({ settings: current, predictions: merged });
        lastRefresh.current = Date.now();

        /* Hand the future ones to the operating system. */
        if (current.enabled && notificationsSupported) {
          const state = await ensurePermission();
          setPermission(state);
          setScheduled(state === 'granted' ? await syncSchedule(merged) : 0);
        } else {
          await cancelScheduled();
          setScheduled(0);
        }
      } finally {
        running.current = false;
        setWorking(false);
      }
    },
    [persist],
  );

  /* Write on launch, and whenever the chart or the settings change. */
  useEffect(() => {
    if (!hydrated || !profileHydrated || !profile.birthDate) return;
    void refresh();
  }, [hydrated, profileHydrated, profile.birthDate, signature, settings, refresh]);

  /* Coming back to the app is the moment to top the schedule up. */
  useEffect(() => {
    const onChange = (state: AppStateStatus) => {
      if (state !== 'active') return;
      if (Date.now() - lastRefresh.current < REFRESH_INTERVAL_MS) return;
      void refresh();
    };

    const subscription = AppState.addEventListener('change', onChange);
    return () => subscription.remove();
  }, [refresh]);

  useEffect(() => {
    if (!notificationsSupported) return;
    void permissionState().then(setPermission);
  }, []);

  /* ---------------------------------------------------------------- *
   * Opening a reading from its notification
   * ---------------------------------------------------------------- */

  useEffect(() => {
    if (!notificationsSupported) return;

    const open = (id: string) => router.push(`/prediction/${id}`);

    const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
      const id = predictionIdOf(response);
      if (id) open(id);
    });

    // A tap that launched the app arrives before anything is mounted, so it is
    // read back here and opened once the first screen is on screen.
    let timer: ReturnType<typeof setTimeout> | null = null;
    Notifications.getLastNotificationResponseAsync()
      .then((response) => {
        const id = predictionIdOf(response);
        if (id) timer = setTimeout(() => open(id), 400);
      })
      .catch(() => {});

    return () => {
      subscription.remove();
      if (timer) clearTimeout(timer);
    };
  }, [router]);

  /* ---------------------------------------------------------------- *
   * Actions
   * ---------------------------------------------------------------- */

  const updateSettings = useCallback(
    (patch: Partial<PredictionSettings>) => {
      setSettings((currentSettings) => {
        const next = { ...currentSettings, ...patch };
        // The mirror is updated here rather than at the next render, so a
        // caller that saves a key and refreshes in the same breath writes
        // today's readings with that key and not the one it replaced.
        latest.current.settings = next;
        persist({ settings: next, predictions: latest.current.predictions });
        return next;
      });
    },
    [persist],
  );

  const setEnabled = useCallback(
    (enabled: boolean) => updateSettings({ enabled }),
    [updateSettings],
  );

  const setOvernight = useCallback(
    (overnight: boolean) => updateSettings({ overnight }),
    [updateSettings],
  );

  const setApiKey = useCallback((key: string) => updateSettings({ apiKey: key.trim() }), [
    updateSettings,
  ]);

  const markRead = useCallback(
    (id: string) => {
      setPredictions((currentList) => {
        const next = currentList.map((prediction) =>
          prediction.id === id && !prediction.readAt
            ? { ...prediction, readAt: Date.now() }
            : prediction,
        );
        persist({ settings: latest.current.settings, predictions: next });
        return next;
      });
    },
    [persist],
  );

  const findPrediction = useCallback(
    (id: string) => predictions.find((prediction) => prediction.id === id),
    [predictions],
  );

  const now = Date.now();
  const current = useMemo(
    () => predictions.find((prediction) => prediction.at <= now) ?? null,
    // `now` is read once per render on purpose: a reading does not need to
    // change mid-screen, and the app re-renders on every navigation anyway.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [predictions],
  );

  const upcoming = useMemo(
    () =>
      predictions
        .filter((prediction) => prediction.at > now)
        .sort((a, b) => a.at - b.at),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [predictions],
  );

  const sendTest = useCallback(async () => {
    const reading = latest.current.predictions.find((prediction) => prediction.at <= Date.now());
    if (!reading) return false;
    const state = await ensurePermission();
    setPermission(state);
    if (state !== 'granted') return false;
    return presentNow(reading);
  }, []);

  const value = useMemo(
    () => ({
      hydrated,
      settings,
      predictions,
      current,
      upcoming,
      working,
      aiError,
      aiReady,
      permission,
      scheduled,
      setEnabled,
      setOvernight,
      setApiKey,
      refresh,
      markRead,
      findPrediction,
      sendTest,
    }),
    [
      hydrated,
      settings,
      predictions,
      current,
      upcoming,
      working,
      aiError,
      aiReady,
      permission,
      scheduled,
      setEnabled,
      setOvernight,
      setApiKey,
      refresh,
      markRead,
      findPrediction,
      sendTest,
    ],
  );

  return <PredictionsContext.Provider value={value}>{children}</PredictionsContext.Provider>;
}

export function usePredictions(): PredictionsContextValue {
  const ctx = useContext(PredictionsContext);
  if (!ctx) {
    throw new Error('usePredictions must be used inside <PredictionsProvider>');
  }
  return ctx;
}
