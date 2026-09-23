import { useEffect, useState, useSyncExternalStore } from 'react';
import { Share } from 'react-native';

import { analyticsSnapshot, loadAnalytics, subscribeAnalytics } from '@/lib/analytics';

/** "just now", "5 min ago", "3 h ago", "2 days ago", then a date. */
export function ago(ms: number, now = Date.now()): string {
  if (!ms) return 'never';
  const diff = Math.max(0, now - ms);
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} day${days === 1 ? '' : 's'} ago`;
  return new Date(ms).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
}

export function dateTime(ms: number): string {
  if (!ms) return '—';
  return new Date(ms).toLocaleString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function shortDay(key: string): string {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
}

/** The day of the month from a yyyy-mm-dd key, for a chart axis. */
export function dayOfMonth(key: string): string {
  return String(Number(key.slice(8)));
}

export function greeting(date = new Date()): string {
  const hour = date.getHours();
  if (hour < 5) return 'Working late';
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

/** Re-renders whenever the device's usage counts change. */
export function useAnalytics() {
  useEffect(() => {
    loadAnalytics();
  }, []);
  return useSyncExternalStore(subscribeAnalytics, analyticsSnapshot, analyticsSnapshot);
}

/** The current time, ticking once a minute — for "5 min ago" labels. */
export function useNow(intervalMs = 60_000): number {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(timer);
  }, [intervalMs]);
  return now;
}

/** CSV-safe cell. */
export function csvCell(value: unknown): string {
  const text = String(value ?? '');
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

/** Saves text as a file on web, or opens the share sheet on a phone. */
export async function saveText(filename: string, text: string, mime = 'text/plain'): Promise<'saved' | 'shared' | 'failed'> {
  const doc = (globalThis as { document?: Document }).document;
  if (doc && typeof (globalThis as { Blob?: unknown }).Blob !== 'undefined') {
    try {
      const blob = new Blob([text], { type: mime });
      const url = URL.createObjectURL(blob);
      const link = doc.createElement('a');
      link.href = url;
      link.download = filename;
      doc.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 2000);
      return 'saved';
    } catch {
      return 'failed';
    }
  }
  try {
    await Share.share({ title: filename, message: text });
    return 'shared';
  } catch {
    return 'failed';
  }
}
