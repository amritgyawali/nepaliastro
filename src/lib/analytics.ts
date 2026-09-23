import AsyncStorage from '@react-native-async-storage/async-storage';

import { routeKeyOf } from '@/config/screens';

/**
 * Usage counts, kept on this device for the dashboard's Analytics section.
 *
 * Which screens were opened, how many times the app was started, and a
 * handful of named events, bucketed by day. Nothing leaves the device and
 * nothing identifies the person using it — it is the same information the
 * phone could show about itself. The dashboard's own screens are not counted.
 */

const KEY = 'astronepali.analytics.v1';
const KEEP_DAYS = 90;
const RECENT_LIMIT = 200;

export type DayStats = {
  views: number;
  sessions: number;
  screens: Record<string, number>;
  events: Record<string, number>;
};

export type RecentHit = { at: number; kind: 'screen' | 'event' | 'session'; name: string };

export type AnalyticsState = {
  firstSeen: number;
  days: Record<string, DayStats>;
  recent: RecentHit[];
};

let state: AnalyticsState = { firstSeen: Date.now(), days: {}, recent: [] };
let loaded = false;
let saveTimer: ReturnType<typeof setTimeout> | null = null;
let lastScreen = '';
const listeners = new Set<() => void>();

export function dayKey(date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function today(): DayStats {
  const key = dayKey();
  state.days[key] ??= { views: 0, sessions: 0, screens: {}, events: {} };
  return state.days[key];
}

function prune(): void {
  const cutoff = dayKey(new Date(Date.now() - KEEP_DAYS * 86_400_000));
  for (const key of Object.keys(state.days)) if (key < cutoff) delete state.days[key];
}

function changed(): void {
  // A new outer object on every change, so a subscriber comparing snapshots
  // by reference sees that something moved.
  state = { ...state };
  listeners.forEach((listener) => listener());
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    AsyncStorage.setItem(KEY, JSON.stringify(state)).catch(() => {});
  }, 2_000);
}

function remember(hit: Omit<RecentHit, 'at'>): void {
  state.recent = [{ ...hit, at: Date.now() }, ...state.recent].slice(0, RECENT_LIMIT);
}

/** Reads the saved counts. Calls made before it finishes are kept. */
export async function loadAnalytics(): Promise<void> {
  if (loaded) return;
  loaded = true;
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return;
    const stored = JSON.parse(raw) as AnalyticsState;
    const pending = state;
    state = {
      firstSeen: Math.min(stored.firstSeen ?? Date.now(), pending.firstSeen),
      days: stored.days ?? {},
      recent: [...pending.recent, ...(stored.recent ?? [])].slice(0, RECENT_LIMIT),
    };
    // Anything counted while storage was being read is added on top.
    for (const [key, day] of Object.entries(pending.days)) {
      const into = (state.days[key] ??= { views: 0, sessions: 0, screens: {}, events: {} });
      into.views += day.views;
      into.sessions += day.sessions;
      for (const [name, count] of Object.entries(day.screens)) into.screens[name] = (into.screens[name] ?? 0) + count;
      for (const [name, count] of Object.entries(day.events)) into.events[name] = (into.events[name] ?? 0) + count;
    }
    prune();
    changed();
  } catch {
    // Unreadable counts are simply started again.
  }
}

export function trackSession(): void {
  today().sessions += 1;
  remember({ kind: 'session', name: 'App opened' });
  changed();
}

export function trackScreen(pathname: string): void {
  if (!pathname || pathname.startsWith('/admin')) return;
  const key = routeKeyOf(pathname);
  if (key === lastScreen) return;
  lastScreen = key;
  const day = today();
  day.views += 1;
  day.screens[key] = (day.screens[key] ?? 0) + 1;
  remember({ kind: 'screen', name: pathname });
  changed();
}

export function trackEvent(name: string): void {
  const day = today();
  day.events[name] = (day.events[name] ?? 0) + 1;
  remember({ kind: 'event', name });
  changed();
}

export function analyticsSnapshot(): AnalyticsState {
  return state;
}

export function subscribeAnalytics(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function resetAnalytics(): void {
  state = { firstSeen: Date.now(), days: {}, recent: [] };
  lastScreen = '';
  changed();
}

/** Totals over the last `days` days, oldest first, with empty days filled in. */
export function series(days: number): { key: string; stats: DayStats }[] {
  const out: { key: string; stats: DayStats }[] = [];
  for (let i = days - 1; i >= 0; i -= 1) {
    const key = dayKey(new Date(Date.now() - i * 86_400_000));
    out.push({ key, stats: state.days[key] ?? { views: 0, sessions: 0, screens: {}, events: {} } });
  }
  return out;
}

/** Screen counts summed over the last `days` days, highest first. */
export function topScreens(days: number): { key: string; count: number }[] {
  const totals: Record<string, number> = {};
  for (const { stats } of series(days)) {
    for (const [name, count] of Object.entries(stats.screens)) totals[name] = (totals[name] ?? 0) + count;
  }
  return Object.entries(totals)
    .map(([key, count]) => ({ key, count }))
    .sort((a, b) => b.count - a.count);
}

/** The whole record as CSV: one row per day and screen. */
export function analyticsCsv(): string {
  const rows = ['date,kind,name,count'];
  for (const [key, day] of Object.entries(state.days).sort(([a], [b]) => a.localeCompare(b))) {
    rows.push(`${key},total,views,${day.views}`);
    rows.push(`${key},total,sessions,${day.sessions}`);
    for (const [name, count] of Object.entries(day.screens)) rows.push(`${key},screen,"${name}",${count}`);
    for (const [name, count] of Object.entries(day.events)) rows.push(`${key},event,"${name}",${count}`);
  }
  return rows.join('\n');
}
