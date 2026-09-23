import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';

/**
 * Banners and popups a person has closed on this phone, by id, so they stay
 * closed. The dashboard changes a popup's id to show it to everyone again.
 */
const KEY = 'astronepali.dismissed.v1';

let cache: Set<string> | null = null;
const listeners = new Set<() => void>();

async function load(): Promise<Set<string>> {
  if (cache) return cache;
  try {
    const raw = await AsyncStorage.getItem(KEY);
    cache = new Set(raw ? (JSON.parse(raw) as string[]) : []);
  } catch {
    cache = new Set();
  }
  return cache;
}

export function useDismissed(): { ready: boolean; has: (id: string) => boolean; dismiss: (id: string) => void } {
  const [, setVersion] = useState(0);
  const [ready, setReady] = useState(!!cache);

  useEffect(() => {
    let alive = true;
    load().then(() => alive && setReady(true));
    const listener = () => setVersion((v) => v + 1);
    listeners.add(listener);
    return () => {
      alive = false;
      listeners.delete(listener);
    };
  }, []);

  const has = useCallback((id: string) => !!cache?.has(id), []);

  const dismiss = useCallback((id: string) => {
    const set = cache ?? new Set<string>();
    cache = set;
    set.add(id);
    // Only the most recent hundred are worth keeping.
    AsyncStorage.setItem(KEY, JSON.stringify([...set].slice(-100))).catch(() => {});
    listeners.forEach((listener) => listener());
  }, []);

  return { ready, has, dismiss };
}
