/**
 * Reading a config from somewhere else — storage, a file, a server — and
 * comparing two of them.
 *
 * A config saved by an older build may be missing fields a newer one added,
 * and a hand-edited file may have the wrong type in a field. `normalizeConfig`
 * lays whatever arrived over the shipped defaults, field by field, keeping
 * only values of the right kind, so the app always runs on a complete config.
 */
import { defaultConfig } from './defaults';
import { CONFIG_AREAS, type AppConfig, type ConfigArea } from './schema';

type Json = null | boolean | number | string | Json[] | { [key: string]: Json };

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

function emptyLike(value: unknown): unknown {
  if (Array.isArray(value)) return [];
  if (isPlainObject(value)) return {};
  if (typeof value === 'string') return '';
  if (typeof value === 'number') return 0;
  if (typeof value === 'boolean') return false;
  return null;
}

/**
 * `incoming` over `base`: objects merge key by key, and anything else is
 * taken from `incoming` only when it is the same kind of value as `base`.
 * Records whose keys are data rather than fields (`screens`, `strings`,
 * `sceneOverrides`) arrive in `base` empty, so every incoming key is kept.
 */
function overlay(base: unknown, incoming: unknown): unknown {
  if (incoming === undefined) return base;
  if (isPlainObject(base)) {
    if (!isPlainObject(incoming)) return base;
    if (Object.keys(base).length === 0) return incoming;
    const out: Record<string, unknown> = { ...base };
    for (const key of Object.keys(base)) out[key] = overlay(base[key], incoming[key]);
    return out;
  }
  if (Array.isArray(base)) {
    if (!Array.isArray(incoming)) return base;
    const shape = base[0];
    if (!isPlainObject(shape)) return incoming;
    // A record saved before a field existed gets that field, empty.
    return incoming.map((item) => {
      if (!isPlainObject(item)) return item;
      const filled: Record<string, unknown> = { ...item };
      for (const key of Object.keys(shape)) {
        if (!(key in filled)) filled[key] = emptyLike(shape[key]);
      }
      return filled;
    });
  }
  if (base === null) return incoming;
  if (typeof base === typeof incoming) return incoming;
  // A number field that arrived empty from an editor, e.g. `experience: null`.
  if (typeof base === 'number' && incoming === null) return incoming;
  return base;
}

/**
 * A home section added by a later build is missing from a config saved
 * before it existed, and a list is taken whole rather than merged. Put each
 * missing one back after the section it follows by default, so it shows —
 * and can be hidden or moved in the dashboard — like the rest.
 */
function withEveryHomeSection(config: AppConfig, base: AppConfig): AppConfig {
  const defaults = base.home.sections;
  const sections = [...config.home.sections];
  for (const [index, section] of defaults.entries()) {
    if (sections.some((s) => s.id === section.id)) continue;
    const previous = index > 0 ? sections.findIndex((s) => s.id === defaults[index - 1].id) : -1;
    sections.splice(index === 0 ? 0 : previous >= 0 ? previous + 1 : sections.length, 0, { ...section });
  }
  if (sections.length === config.home.sections.length) return config;
  return { ...config, home: { ...config.home, sections } };
}

export function normalizeConfig(input: unknown): AppConfig {
  const base = defaultConfig();
  if (!isPlainObject(input)) return base;
  return withEveryHomeSection(overlay(base, input) as AppConfig, base);
}

/** Why a pasted or downloaded config cannot be used, or `null` if it can. */
export function configProblem(input: unknown): string | null {
  if (!isPlainObject(input)) return 'That is not a config: expected a JSON object.';
  const known = CONFIG_AREAS.filter((area) => area.id in input).length;
  if (known === 0) return 'Nothing in that file looks like an AstroNepali config.';
  if (typeof input.schemaVersion === 'number' && input.schemaVersion > defaultConfig().schemaVersion) {
    return 'That config was made by a newer version of the app. Update the app first.';
  }
  return null;
}

/* ------------------------------------------------------------------ *
 * Comparing
 * ------------------------------------------------------------------ */

export type Change = {
  area: ConfigArea;
  /** Dotted path under the area, e.g. `colors.saffron` or `roster[3].rate`. */
  path: string;
  before: Json | undefined;
  after: Json | undefined;
};

function walk(area: ConfigArea, path: string, a: unknown, b: unknown, out: Change[], limit: number) {
  if (out.length >= limit) return;
  if (JSON.stringify(a) === JSON.stringify(b)) return;

  if (isPlainObject(a) && isPlainObject(b)) {
    const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
    for (const key of keys) walk(area, path ? `${path}.${key}` : key, a[key], b[key], out, limit);
    return;
  }

  if (Array.isArray(a) && Array.isArray(b)) {
    // Lists of records with ids are compared by id, so moving one item is
    // one change rather than a change at every index after it.
    const ids = (list: unknown[]) =>
      list.every((item) => isPlainObject(item) && typeof item.id === 'string')
        ? (list as { id: string }[]).map((item) => item.id)
        : null;
    const aIds = ids(a);
    const bIds = ids(b);
    if (aIds && bIds) {
      if (aIds.join('|') !== bIds.join('|') && [...aIds].sort().join('|') === [...bIds].sort().join('|')) {
        out.push({ area, path: `${path} (order)`, before: aIds, after: bIds });
      }
      for (const id of new Set([...aIds, ...bIds])) {
        const before = (a as { id: string }[]).find((item) => item.id === id);
        const after = (b as { id: string }[]).find((item) => item.id === id);
        walk(area, `${path}[${id}]`, before, after, out, limit);
      }
      return;
    }
  }

  out.push({ area, path, before: a as Json | undefined, after: b as Json | undefined });
}

/** Every field that differs between two configs, area by area. */
export function diffConfigs(before: AppConfig, after: AppConfig, limit = 500): Change[] {
  const out: Change[] = [];
  for (const { id } of CONFIG_AREAS) walk(id, '', before[id], after[id], out, limit);
  return out;
}

/** The areas that differ, without listing every field. */
export function changedAreas(before: AppConfig, after: AppConfig): ConfigArea[] {
  return CONFIG_AREAS.filter(
    ({ id }) => JSON.stringify(before[id]) !== JSON.stringify(after[id]),
  ).map(({ id }) => id);
}
