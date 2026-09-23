import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {
  createContext,
  useCallback,
  useContext,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { AppState } from 'react-native';

import { applyConfig } from './apply';
import { clone, defaultConfig } from './defaults';
import { changedAreas, normalizeConfig } from './merge';
import { DEVICE_CONFIG_URL, pullConfig } from './remote';
import type { AppConfig, ConfigArea } from './schema';

/**
 * The app's config: the live one it runs on, the draft the dashboard edits,
 * and the history of what was published before.
 *
 * Publishing copies the draft to live, applies it to the running app and
 * remounts the navigator so every screen draws again with it. The same path
 * serves a rollback, an import and a preview — a preview applies the draft
 * without saving it, until it is ended or published.
 */

const KEYS = {
  live: 'astronepali.config.live.v1',
  draft: 'astronepali.config.draft.v1',
  history: 'astronepali.config.history.v1',
  schedule: 'astronepali.config.schedule.v1',
} as const;

/** Published versions kept for rollback, newest first. */
const HISTORY_LIMIT = 15;

export type Revision = {
  id: string;
  revision: number;
  publishedAt: number;
  publishedBy: string;
  note: string;
  config: AppConfig;
};

export type ScheduledPublish = { at: number; note: string; by: string };

type ConfigContextValue = {
  ready: boolean;
  live: AppConfig;
  draft: AppConfig;
  history: Revision[];
  /** Areas where the draft differs from live. */
  dirty: ConfigArea[];
  /** Changes whenever the running app should draw again from scratch. */
  mountKey: number;
  previewing: boolean;
  scheduled: ScheduledPublish | null;

  setDraft: (next: AppConfig | ((current: AppConfig) => AppConfig)) => void;
  /** Puts one area of the draft back to what ships. */
  resetArea: (area: ConfigArea) => void;
  discardDraft: () => void;
  publish: (note: string, by: string) => AppConfig;
  rollback: (revisionId: string, by: string) => void;
  /** Replaces the draft with a config from outside. It is not live until published. */
  importDraft: (config: unknown) => void;
  /** Makes an outside config live straight away, as a remote pull does. */
  adopt: (config: AppConfig) => void;
  startPreview: () => void;
  stopPreview: () => void;
  schedulePublish: (plan: ScheduledPublish | null) => void;
  /** Where the app should land after the next remount. */
  setReturnTo: (path: string | null) => void;
  takeReturnTo: () => string | null;
  factoryReset: () => void;
};

const ConfigContext = createContext<ConfigContextValue | null>(null);

function read<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function write(key: string, value: unknown): void {
  AsyncStorage.setItem(key, JSON.stringify(value)).catch(() => {
    // Storage is best-effort: the session still runs on what is in memory.
  });
}

export function ConfigProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [live, setLive] = useState<AppConfig>(defaultConfig);
  const [draft, setDraftState] = useState<AppConfig>(defaultConfig);
  const [history, setHistory] = useState<Revision[]>([]);
  const [mountKey, setMountKey] = useState(0);
  const [previewing, setPreviewing] = useState(false);
  const [scheduled, setScheduled] = useState<ScheduledPublish | null>(null);

  const returnTo = useRef<string | null>(null);
  const draftTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const liveRef = useRef(live);
  const draftRef = useRef(draft);
  liveRef.current = live;
  draftRef.current = draft;

  /** Applies a config and asks every screen to draw again. */
  const run = useCallback((config: AppConfig) => {
    applyConfig(config);
    setMountKey((key) => key + 1);
  }, []);

  /* ---------------------------------------------------------------- *
   * Start-up: read what was saved, run on it, then look for a newer
   * published config if this build knows where to find one.
   * ---------------------------------------------------------------- */
  useEffect(() => {
    let cancelled = false;

    (async () => {
      const [[, liveRaw], [, draftRaw], [, historyRaw], [, scheduleRaw]] =
        await AsyncStorage.multiGet([KEYS.live, KEYS.draft, KEYS.history, KEYS.schedule]).catch(
          () => [[KEYS.live, null], [KEYS.draft, null], [KEYS.history, null], [KEYS.schedule, null]] as [string, string | null][],
        );
      if (cancelled) return;

      const storedLive = read<unknown>(liveRaw);
      const nextLive = storedLive ? normalizeConfig(storedLive) : defaultConfig();
      const storedDraft = read<unknown>(draftRaw);
      const nextDraft = storedDraft ? normalizeConfig(storedDraft) : clone(nextLive);
      const storedHistory = read<Revision[]>(historyRaw) ?? [];

      applyConfig(nextLive);
      setLive(nextLive);
      setDraftState(nextDraft);
      setHistory(
        storedHistory.map((entry) => ({ ...entry, config: normalizeConfig(entry.config) })),
      );
      setScheduled(read<ScheduledPublish>(scheduleRaw));
      setReady(true);

      if (!DEVICE_CONFIG_URL) return;
      try {
        const remote = await pullConfig({ url: DEVICE_CONFIG_URL, headerName: '', token: '' });
        if (cancelled || remote.meta.revision <= nextLive.meta.revision) return;
        write(KEYS.live, remote);
        setLive(remote);
        // Nobody was editing here, so the draft simply follows.
        if (!storedDraft) setDraftState(clone(remote));
        run(remote);
      } catch {
        // Offline, or the file is not there yet: keep running on what we have.
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [run]);

  /* ---------------------------------------------------------------- *
   * Draft
   * ---------------------------------------------------------------- */

  // Typing saves the draft a moment after the last key, not on every one; an
  // edit still waiting is written at once if the app goes to the background
  // or the browser tab is closed, so nothing typed is lost.
  const pendingDraft = useRef<AppConfig | null>(null);

  const flushDraft = useCallback(() => {
    if (draftTimer.current) clearTimeout(draftTimer.current);
    draftTimer.current = null;
    if (pendingDraft.current) write(KEYS.draft, pendingDraft.current);
    pendingDraft.current = null;
  }, []);

  const setDraft = useCallback(
    (next: AppConfig | ((current: AppConfig) => AppConfig)) => {
      setDraftState((current) => {
        const value = typeof next === 'function' ? next(current) : next;
        pendingDraft.current = value;
        if (draftTimer.current) clearTimeout(draftTimer.current);
        draftTimer.current = setTimeout(flushDraft, 300);
        return value;
      });
    },
    [flushDraft],
  );

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state !== 'active') flushDraft();
    });
    const win = (globalThis as { addEventListener?: (type: string, fn: () => void) => void; removeEventListener?: (type: string, fn: () => void) => void });
    win.addEventListener?.('pagehide', flushDraft);
    win.addEventListener?.('beforeunload', flushDraft);
    return () => {
      subscription.remove();
      win.removeEventListener?.('pagehide', flushDraft);
      win.removeEventListener?.('beforeunload', flushDraft);
      flushDraft();
    };
  }, [flushDraft]);

  const resetArea = useCallback(
    (area: ConfigArea) => {
      const fresh = defaultConfig();
      setDraft((current) => ({ ...current, [area]: fresh[area] }));
    },
    [setDraft],
  );

  const discardDraft = useCallback(() => {
    setDraft(clone(liveRef.current));
  }, [setDraft]);

  /* ---------------------------------------------------------------- *
   * Publishing
   * ---------------------------------------------------------------- */

  const makeLive = useCallback(
    (config: AppConfig, note: string, by: string) => {
      const previous = liveRef.current;
      const next: AppConfig = {
        ...clone(config),
        meta: {
          revision: Math.max(previous.meta.revision, config.meta.revision) + 1,
          publishedAt: Date.now(),
          publishedBy: by,
          note: note.trim(),
        },
      };

      setHistory((current) => {
        const entry: Revision = {
          id: `r${previous.meta.revision}-${previous.meta.publishedAt}`,
          revision: previous.meta.revision,
          publishedAt: previous.meta.publishedAt,
          publishedBy: previous.meta.publishedBy,
          note: previous.meta.note,
          config: previous,
        };
        const updated = [entry, ...current.filter((item) => item.id !== entry.id)].slice(
          0,
          HISTORY_LIMIT,
        );
        write(KEYS.history, updated);
        return updated;
      });

      write(KEYS.live, next);
      setLive(next);
      setDraft(clone(next));
      setPreviewing(false);
      run(next);
      return next;
    },
    [run, setDraft],
  );

  const publish = useCallback(
    (note: string, by: string) => makeLive(draftRef.current, note, by),
    [makeLive],
  );

  const rollback = useCallback(
    (revisionId: string, by: string) => {
      const entry = history.find((item) => item.id === revisionId);
      if (!entry) return;
      makeLive(entry.config, `Rolled back to revision ${entry.revision}`, by);
    },
    [history, makeLive],
  );

  const importDraft = useCallback(
    (config: unknown) => {
      setDraft(normalizeConfig(config));
    },
    [setDraft],
  );

  const adopt = useCallback(
    (config: AppConfig) => {
      write(KEYS.live, config);
      setLive(config);
      setDraft(clone(config));
      setPreviewing(false);
      run(config);
    },
    [run, setDraft],
  );

  const startPreview = useCallback(() => {
    setPreviewing(true);
    run(draftRef.current);
  }, [run]);

  const stopPreview = useCallback(() => {
    setPreviewing(false);
    run(liveRef.current);
  }, [run]);

  const schedulePublish = useCallback((plan: ScheduledPublish | null) => {
    setScheduled(plan);
    if (plan) write(KEYS.schedule, plan);
    else AsyncStorage.removeItem(KEYS.schedule).catch(() => {});
  }, []);

  // A scheduled publish goes out when its time comes, as long as the app is
  // open on the device that scheduled it — there is no server to do it.
  useEffect(() => {
    if (!ready || !scheduled) return;
    const due = () => {
      if (Date.now() < scheduled.at) return false;
      makeLive(draftRef.current, scheduled.note || 'Scheduled publish', scheduled.by);
      schedulePublish(null);
      return true;
    };
    if (due()) return;
    const timer = setInterval(due, 15_000);
    return () => clearInterval(timer);
  }, [ready, scheduled, makeLive, schedulePublish]);

  const setReturnTo = useCallback((path: string | null) => {
    returnTo.current = path;
  }, []);

  const takeReturnTo = useCallback(() => {
    const path = returnTo.current;
    returnTo.current = null;
    return path;
  }, []);

  const factoryReset = useCallback(() => {
    const fresh = defaultConfig();
    AsyncStorage.multiRemove([KEYS.live, KEYS.draft, KEYS.history, KEYS.schedule]).catch(() => {});
    setHistory([]);
    setScheduled(null);
    setLive(fresh);
    setDraftState(clone(fresh));
    setPreviewing(false);
    run(fresh);
  }, [run]);

  // Comparing whole configs on every keystroke would slow typing down, so the
  // comparison trails the draft by a render.
  const settledDraft = useDeferredValue(draft);
  const dirty = useMemo(() => changedAreas(live, settledDraft), [live, settledDraft]);

  const value = useMemo<ConfigContextValue>(
    () => ({
      ready,
      live,
      draft,
      history,
      dirty,
      mountKey,
      previewing,
      scheduled,
      setDraft,
      resetArea,
      discardDraft,
      publish,
      rollback,
      importDraft,
      adopt,
      startPreview,
      stopPreview,
      schedulePublish,
      setReturnTo,
      takeReturnTo,
      factoryReset,
    }),
    [
      ready, live, draft, history, dirty, mountKey, previewing, scheduled, setDraft, resetArea,
      discardDraft, publish, rollback, importDraft, adopt, startPreview, stopPreview,
      schedulePublish, setReturnTo, takeReturnTo, factoryReset,
    ],
  );

  return <ConfigContext.Provider value={value}>{children}</ConfigContext.Provider>;
}

export function useAppConfig(): ConfigContextValue {
  const ctx = useContext(ConfigContext);
  if (!ctx) throw new Error('useAppConfig must be used inside <ConfigProvider>');
  return ctx;
}

/**
 * The config the app is showing right now: the draft while an admin is
 * previewing it, the live one otherwise.
 */
export function useShownConfig(): AppConfig {
  const { live, draft, previewing } = useAppConfig();
  return previewing ? draft : live;
}
