import { useCallback } from 'react';

import type { AppConfig, ConfigArea } from '@/config/schema';
import { CONFIG_AREAS } from '@/config/schema';
import { useAppConfig } from '@/config/store';

import type { Permission } from './auth/rbac';
import { useAdmin } from './auth/store';

/** The permission that lets someone change each part of the draft. */
export const EDIT_PERMISSION: Record<ConfigArea, Permission> = {
  branding: 'branding.edit',
  theme: 'design.edit',
  typography: 'design.edit',
  layout: 'design.edit',
  home: 'navigation.edit',
  navigation: 'navigation.edit',
  screens: 'screens.edit',
  pages: 'screens.edit',
  features: 'screens.edit',
  services: 'catalog.edit',
  astrologers: 'catalog.edit',
  remedies: 'catalog.edit',
  media: 'media.edit',
  content: 'content.edit',
  engagement: 'engagement.edit',
  ai: 'ai.edit',
};

/** Parts of the dashboard that are not parts of the config, as the log names them. */
const OTHER_AREAS: Record<string, string> = {
  publish: 'Publishing',
  security: 'Security',
  team: 'Team',
  roles: 'Roles',
  system: 'System',
  analytics: 'Analytics',
  audit: 'Activity log',
};

export function areaLabel(area: string): string {
  return CONFIG_AREAS.find((entry) => entry.id === area)?.label ?? OTHER_AREAS[area] ?? area;
}

/**
 * One part of the draft, with the means to change it.
 *
 * Every change is checked against the signed-in person's role, written to
 * the draft (never straight to live), and noted in the activity log — with
 * repeated edits to the same field folded into one entry.
 */
export function useArea<K extends ConfigArea>(area: K) {
  const { draft, live, setDraft, dirty } = useAppConfig();
  const { can, log, touch } = useAdmin();
  const canEdit = can(EDIT_PERMISSION[area]);

  const update = useCallback(
    (next: AppConfig[K] | ((current: AppConfig[K]) => AppConfig[K]), what: string) => {
      if (!canEdit) return;
      setDraft((current) => ({
        ...current,
        [area]:
          typeof next === 'function'
            ? (next as (value: AppConfig[K]) => AppConfig[K])(current[area])
            : next,
      }));
      log('Edited the draft', area, `${areaLabel(area)} · ${what}`, `${area}:${what}`);
      touch();
    },
    [area, canEdit, log, setDraft, touch],
  );

  const patch = useCallback(
    (partial: Partial<AppConfig[K]>, what: string) =>
      update((current) => ({ ...(current as object), ...(partial as object) }) as AppConfig[K], what),
    [update],
  );

  return {
    value: draft[area],
    live: live[area],
    changed: dirty.includes(area),
    canEdit,
    update,
    patch,
  };
}

/** A short random id for a new record. */
export function newId(prefix = ''): string {
  return `${prefix}${Date.now().toString(36).slice(-4)}${Math.random().toString(36).slice(2, 6)}`;
}

/** Moves the item at `index` by `by` places, clamped to the list. */
export function move<T>(items: T[], index: number, by: number): T[] {
  const target = Math.max(0, Math.min(items.length - 1, index + by));
  if (target === index) return items;
  const next = [...items];
  const [item] = next.splice(index, 1);
  next.splice(target, 0, item);
  return next;
}

/** A URL-safe slug from a title. */
export function slugify(text: string): string {
  return (
    text
      .toLowerCase()
      .normalize('NFKD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 48) || 'page'
  );
}
