/**
 * Ready-made starting points for the design tools. Each is a complete value
 * for its part of the config, so choosing one never leaves a token half set.
 */
import type { ColorToken } from '@/theme/colors';
import { themeDefaults } from '@/theme/runtime';

import { brandScale, darkFrom, fromHsl, mix, toHex } from './color';
import type { LayoutConfig, RadiusStep, SpaceStep, TypeStep, TypographyConfig } from './schema';

type Palette = Record<ColorToken, string>;

/** A light theme around `brand`, on neutrals tinted towards `hue`. */
function lightTheme(brand: string, hue?: number, tint = 0.06): Palette {
  const base: Palette = { ...themeDefaults.colors };
  if (hue === undefined) return { ...base, ...brandScale(brand) };
  const neutral = (l: number, s = tint) => toHex(fromHsl({ h: hue, s, l }));
  return {
    ...base,
    ...brandScale(brand),
    canvas: neutral(0.965),
    fill: neutral(0.94),
    ink: neutral(0.1, 0.12),
    body: neutral(0.22, 0.08),
    muted: neutral(0.41),
    subtle: neutral(0.58),
    border: neutral(0.87),
    divider: neutral(0.92),
  };
}

export type ThemePreset = { id: string; name: string; note: string; colors: () => Palette };

export const THEME_PRESETS: ThemePreset[] = [
  {
    id: 'saffron',
    name: 'Saffron',
    note: 'As shipped: deep saffron on warm neutrals',
    colors: () => ({ ...themeDefaults.colors }),
  },
  {
    id: 'rhododendron',
    name: 'Laligurans',
    note: 'The national flower’s crimson',
    colors: () => lightTheme('#C8203A', 350, 0.05),
  },
  {
    id: 'himalaya',
    name: 'Himalaya',
    note: 'Glacier blue on cool greys',
    colors: () => lightTheme('#2563C9', 215, 0.08),
  },
  {
    id: 'tulsi',
    name: 'Tulsi',
    note: 'Leaf green, calm and plain',
    colors: () => lightTheme('#2E7D4F', 140, 0.05),
  },
  {
    id: 'marigold',
    name: 'Sayapatri',
    note: 'Tihar marigold, bright and warm',
    colors: () => lightTheme('#F2A900', 42, 0.07),
  },
  {
    id: 'sindoor',
    name: 'Sindoor',
    note: 'Vermilion for a bolder brand',
    colors: () => lightTheme('#E0432B', 12, 0.05),
  },
  {
    id: 'tamba',
    name: 'Tamba',
    note: 'Beaten copper, like a puja kalash',
    colors: () => lightTheme('#B8642A', 25, 0.06),
  },
  {
    id: 'monsoon',
    name: 'Monsoon',
    note: 'Teal rain and slate',
    colors: () => lightTheme('#0F8A8A', 190, 0.07),
  },
  {
    id: 'ratri',
    name: 'Ratri (dark)',
    note: 'The shipped palette, turned dark',
    colors: () => darkFrom({ ...themeDefaults.colors }),
  },
  {
    id: 'ratri-sayapatri',
    name: 'Diyo (dark)',
    note: 'Marigold on a warm dark background',
    colors: () => darkFrom(lightTheme('#F2A900', 42, 0.07)),
  },
];

/* ------------------------------------------------------------------ *
 * Typography
 * ------------------------------------------------------------------ */

export type TypePreset = { id: string; name: string; note: string; apply: (t: TypographyConfig) => TypographyConfig };

function scaleSteps(t: TypographyConfig, factor: number, leading = 1): TypographyConfig {
  const steps = { ...t.steps };
  for (const key of Object.keys(steps) as TypeStep[]) {
    const size = Math.round(themeDefaults.type[key].fontSize! * factor * 2) / 2;
    const line = Math.round((themeDefaults.type[key].lineHeight! / themeDefaults.type[key].fontSize!) * size * leading);
    steps[key] = { ...steps[key], fontSize: size, lineHeight: line };
  }
  return { ...t, steps };
}

export const TYPE_PRESETS: TypePreset[] = [
  { id: 'default', name: 'As shipped', note: 'The original scale', apply: (t) => ({ ...scaleSteps(t, 1), scale: 1 }) },
  { id: 'compact', name: 'Compact', note: 'More on each screen', apply: (t) => ({ ...scaleSteps(t, 0.92, 0.96), scale: 1 }) },
  { id: 'relaxed', name: 'Relaxed', note: 'Airier lines, same sizes', apply: (t) => ({ ...scaleSteps(t, 1, 1.12), scale: 1 }) },
  { id: 'large', name: 'Large', note: 'Bigger type for older eyes', apply: (t) => ({ ...scaleSteps(t, 1, 1), scale: 1.15 }) },
  { id: 'accessible', name: 'Largest', note: 'Everything a third larger', apply: (t) => ({ ...scaleSteps(t, 1, 1.05), scale: 1.3 }) },
];

/* ------------------------------------------------------------------ *
 * Spacing and corners
 * ------------------------------------------------------------------ */

export type LayoutPreset = { id: string; name: string; note: string; apply: (l: LayoutConfig) => LayoutConfig };

function scaleSpace(factor: number): Record<SpaceStep, number> {
  const out = { ...themeDefaults.space };
  for (const key of Object.keys(out) as SpaceStep[]) {
    out[key] = Math.max(2, Math.round(themeDefaults.space[key] * factor));
  }
  return out;
}

export const DENSITY_PRESETS: LayoutPreset[] = [
  { id: 'compact', name: 'Compact', note: '80% spacing', apply: (l) => ({ ...l, space: scaleSpace(0.8), gutter: 16 }) },
  { id: 'default', name: 'Comfortable', note: 'As shipped', apply: (l) => ({ ...l, space: { ...themeDefaults.space }, gutter: themeDefaults.layout.GUTTER }) },
  { id: 'spacious', name: 'Spacious', note: '125% spacing', apply: (l) => ({ ...l, space: scaleSpace(1.25), gutter: 24 }) },
];

function radii(sm: number, md: number, lg: number): Record<RadiusStep, number> {
  return { sm, md, lg, pill: 999 };
}

export const RADIUS_PRESETS: LayoutPreset[] = [
  { id: 'sharp', name: 'Sharp', note: 'Square corners', apply: (l) => ({ ...l, radius: radii(2, 3, 4) }) },
  { id: 'soft', name: 'Soft', note: 'As shipped', apply: (l) => ({ ...l, radius: { ...themeDefaults.radius } }) },
  { id: 'round', name: 'Round', note: 'Generous curves', apply: (l) => ({ ...l, radius: radii(12, 18, 24) }) },
];

/** A soft tint of a colour on white, for swatch backgrounds in the editor. */
export function wash(color: string): string {
  return mix('#FFFFFF', color, 0.12);
}
