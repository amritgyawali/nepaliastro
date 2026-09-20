import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

export type Gender = 'male' | 'female';

export type OnboardingProfile = {
  name: string;
  gender: Gender | null;
  birthDate: { day: number; month: number; year: number } | null;
  birthTime: { hour: number; minute: number; period: 'AM' | 'PM' } | null;
  /** Set when the user ticks "Don't know my exact time of birth". */
  birthTimeUnknown: boolean;
  birthPlace: string;
  languages: string[];
  completed: boolean;
  /** True once the "1 minute free chat" offer has been claimed. */
  freeMinuteClaimed: boolean;
  /** True once that free minute has actually run out in a chat. */
  freeMinuteUsed: boolean;
};

/** Pre-filled with the values shown in the reference screenshots. */
const initialProfile: OnboardingProfile = {
  name: '',
  gender: null,
  birthDate: { day: 19, month: 9, year: 2006 },
  birthTime: { hour: 9, minute: 56, period: 'PM' },
  birthTimeUnknown: false,
  birthPlace: '',
  languages: ['English'],
  completed: false,
  freeMinuteClaimed: false,
  freeMinuteUsed: false,
};

const STORAGE_KEY = 'astronepali.onboarding.v1';

type OnboardingContextValue = {
  profile: OnboardingProfile;
  /** False until the persisted profile has been read back from storage. */
  hydrated: boolean;
  update: (patch: Partial<OnboardingProfile>) => void;
  toggleLanguage: (language: string) => void;
  complete: () => void;
  reset: () => void;
};

const OnboardingContext = createContext<OnboardingContextValue | null>(null);

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<OnboardingProfile>(initialProfile);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let cancelled = false;
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (cancelled || !raw) return;
        const stored = JSON.parse(raw) as Partial<OnboardingProfile>;
        setProfile((current) => ({ ...current, ...stored }));
      })
      .catch(() => {
        // A failed read just means we start from the defaults.
      })
      .finally(() => {
        if (!cancelled) setHydrated(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const persist = useCallback((next: OnboardingProfile) => {
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => {
      // Persistence is best-effort; the session still works in memory.
    });
  }, []);

  const update = useCallback(
    (patch: Partial<OnboardingProfile>) => {
      setProfile((current) => {
        const next = { ...current, ...patch };
        persist(next);
        return next;
      });
    },
    [persist],
  );

  const toggleLanguage = useCallback(
    (language: string) => {
      setProfile((current) => {
        const selected = current.languages.includes(language);
        const languages = selected
          ? current.languages.filter((l) => l !== language)
          : [...current.languages, language];
        const next = { ...current, languages };
        persist(next);
        return next;
      });
    },
    [persist],
  );

  const complete = useCallback(() => update({ completed: true }), [update]);

  const reset = useCallback(() => {
    setProfile(initialProfile);
    AsyncStorage.removeItem(STORAGE_KEY).catch(() => {});
  }, []);

  const value = useMemo(
    () => ({ profile, hydrated, update, toggleLanguage, complete, reset }),
    [profile, hydrated, update, toggleLanguage, complete, reset],
  );

  return <OnboardingContext.Provider value={value}>{children}</OnboardingContext.Provider>;
}

export function useOnboarding(): OnboardingContextValue {
  const ctx = useContext(OnboardingContext);
  if (!ctx) {
    throw new Error('useOnboarding must be used inside <OnboardingProvider>');
  }
  return ctx;
}
