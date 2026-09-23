/**
 * Colour arithmetic for the theme editor: parsing, mixing, WCAG contrast,
 * deriving a whole brand scale from one colour, and building a dark theme.
 *
 * Everything works on `#rrggbb`, `#rgb`, `#rrggbbaa` and `rgb()/rgba()`
 * strings, which is everything the theme is written in.
 */
import type { ColorToken } from '@/theme/colors';

export type RGBA = { r: number; g: number; b: number; a: number };
export type HSL = { h: number; s: number; l: number };

const clamp = (value: number, min = 0, max = 255) => Math.min(max, Math.max(min, value));

export function parseColor(input: string): RGBA | null {
  const value = input.trim().toLowerCase();
  if (value === 'transparent') return { r: 0, g: 0, b: 0, a: 0 };

  const hex = value.match(/^#([0-9a-f]{3,8})$/);
  if (hex) {
    let digits = hex[1];
    if (digits.length === 3 || digits.length === 4) {
      digits = digits
        .split('')
        .map((d) => d + d)
        .join('');
    }
    if (digits.length !== 6 && digits.length !== 8) return null;
    return {
      r: parseInt(digits.slice(0, 2), 16),
      g: parseInt(digits.slice(2, 4), 16),
      b: parseInt(digits.slice(4, 6), 16),
      a: digits.length === 8 ? parseInt(digits.slice(6, 8), 16) / 255 : 1,
    };
  }

  const rgb = value.match(/^rgba?\(([^)]+)\)$/);
  if (rgb) {
    const parts = rgb[1].split(/[,\s/]+/).filter(Boolean).map(Number);
    if (parts.length < 3 || parts.slice(0, 3).some((n) => Number.isNaN(n))) return null;
    return {
      r: clamp(parts[0]),
      g: clamp(parts[1]),
      b: clamp(parts[2]),
      a: parts.length > 3 && !Number.isNaN(parts[3]) ? Math.min(1, Math.max(0, parts[3])) : 1,
    };
  }

  return null;
}

export function isColor(input: string): boolean {
  return parseColor(input) !== null;
}

const hex2 = (n: number) => Math.round(clamp(n)).toString(16).padStart(2, '0');

export function toHex({ r, g, b, a }: RGBA): string {
  const base = `#${hex2(r)}${hex2(g)}${hex2(b)}`.toUpperCase();
  return a < 1 ? `rgba(${Math.round(r)},${Math.round(g)},${Math.round(b)},${+a.toFixed(3)})` : base;
}

/** Normalises any accepted colour to `#RRGGBB` (or `rgba()` when translucent). */
export function normalize(input: string): string {
  const parsed = parseColor(input);
  return parsed ? toHex(parsed) : input;
}

export function toHsl({ r, g, b }: RGBA): HSL {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  if (max === min) return { h: 0, s: 0, l };
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h: number;
  if (max === rn) h = (gn - bn) / d + (gn < bn ? 6 : 0);
  else if (max === gn) h = (bn - rn) / d + 2;
  else h = (rn - gn) / d + 4;
  return { h: h * 60, s, l };
}

export function fromHsl({ h, s, l }: HSL, a = 1): RGBA {
  const hue = ((h % 360) + 360) % 360 / 360;
  if (s === 0) return { r: l * 255, g: l * 255, b: l * 255, a };
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const channel = (t: number) => {
    let x = t;
    if (x < 0) x += 1;
    if (x > 1) x -= 1;
    if (x < 1 / 6) return p + (q - p) * 6 * x;
    if (x < 1 / 2) return q;
    if (x < 2 / 3) return p + (q - p) * (2 / 3 - x) * 6;
    return p;
  };
  return { r: channel(hue + 1 / 3) * 255, g: channel(hue) * 255, b: channel(hue - 1 / 3) * 255, a };
}

/** `amount` of `b` over `a`: 0 is all `a`, 1 is all `b`. */
export function mix(a: string, b: string, amount: number): string {
  const ca = parseColor(a);
  const cb = parseColor(b);
  if (!ca || !cb) return a;
  const t = Math.min(1, Math.max(0, amount));
  return toHex({
    r: ca.r + (cb.r - ca.r) * t,
    g: ca.g + (cb.g - ca.g) * t,
    b: ca.b + (cb.b - ca.b) * t,
    a: 1,
  });
}

export function adjust(input: string, change: Partial<{ h: number; s: number; l: number }>): string {
  const parsed = parseColor(input);
  if (!parsed) return input;
  const hsl = toHsl(parsed);
  return toHex(
    fromHsl({
      h: hsl.h + (change.h ?? 0),
      s: Math.min(1, Math.max(0, hsl.s + (change.s ?? 0))),
      l: Math.min(1, Math.max(0, hsl.l + (change.l ?? 0))),
    }),
  );
}

/* ------------------------------------------------------------------ *
 * Contrast
 * ------------------------------------------------------------------ */

export function luminance(input: string): number {
  const c = parseColor(input);
  if (!c) return 0;
  const lin = (v: number) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * lin(c.r) + 0.7152 * lin(c.g) + 0.0722 * lin(c.b);
}

/** WCAG 2 contrast ratio, 1 to 21. */
export function contrast(a: string, b: string): number {
  const la = luminance(a);
  const lb = luminance(b);
  const [hi, lo] = la > lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
}

export type ContrastGrade = 'AAA' | 'AA' | 'AA large' | 'Fail';

export function grade(ratio: number): ContrastGrade {
  if (ratio >= 7) return 'AAA';
  if (ratio >= 4.5) return 'AA';
  if (ratio >= 3) return 'AA large';
  return 'Fail';
}

/** Near-black or white, whichever reads better on `background`. */
export function readableOn(background: string, dark = '#1B1A17', light = '#FFFFFF'): string {
  return contrast(background, dark) >= contrast(background, light) ? dark : light;
}

/** The pairs of tokens that are drawn on top of each other in the app. */
export const CONTRAST_PAIRS: { fg: ColorToken; bg: ColorToken; use: string; large?: boolean }[] = [
  { fg: 'ink', bg: 'white', use: 'Headings and body text' },
  { fg: 'body', bg: 'white', use: 'Running text' },
  { fg: 'muted', bg: 'white', use: 'Supporting lines' },
  { fg: 'subtle', bg: 'white', use: 'Timestamps and hints', large: true },
  { fg: 'onSaffron', bg: 'saffron', use: 'Button labels' },
  { fg: 'saffronDeep', bg: 'white', use: 'Links and icons' },
  { fg: 'saffronDeep', bg: 'saffronSoft', use: 'Selected chips and icon tiles' },
  { fg: 'ink', bg: 'canvas', use: 'Text on the page background' },
  { fg: 'green', bg: 'greenSoft', use: 'Success badges' },
  { fg: 'red', bg: 'redSoft', use: 'Error badges' },
  { fg: 'white', bg: 'red', use: 'Destructive buttons' },
];

/* ------------------------------------------------------------------ *
 * Building palettes
 * ------------------------------------------------------------------ */

/** The six brand tokens, derived from the one colour a person picks. */
export function brandScale(brand: string, surface = '#FFFFFF'): Pick<
  Record<ColorToken, string>,
  'saffron' | 'saffronPressed' | 'saffronDeep' | 'saffronSoft' | 'saffronBorder' | 'onSaffron'
> {
  const base = normalize(brand);
  const parsed = parseColor(base);
  const hsl = parsed ? toHsl(parsed) : { h: 30, s: 1, l: 0.6 };
  const darkSurface = luminance(surface) < 0.2;

  // The deep tone has to be readable as text on the surface: darken (or, on
  // a dark surface, lighten) until it clears AA, rather than by a fixed step.
  const soft = mix(surface, base, darkSurface ? 0.16 : 0.1);
  let deep = base;
  for (let i = 0; i < 24 && (contrast(deep, surface) < 4.6 || contrast(deep, soft) < 4.5); i += 1) {
    deep = adjust(deep, { l: darkSurface ? 0.04 : -0.04 });
  }

  return {
    saffron: base,
    saffronPressed: adjust(base, { l: darkSurface ? 0.06 : -0.07 }),
    saffronDeep: deep,
    saffronSoft: soft,
    saffronBorder: mix(surface, base, darkSurface ? 0.38 : 0.36),
    onSaffron: readableOn(
      base,
      toHex(fromHsl({ h: hsl.h, s: Math.min(0.7, hsl.s), l: 0.1 })),
      '#FFFFFF',
    ),
  };
}

/**
 * A dark theme from a light one: the neutral scale is inverted around a warm
 * near-black, the brand colour keeps its hue, and the status colours are
 * lifted until they read on the dark surface.
 */
export function darkFrom(light: Record<ColorToken, string>): Record<ColorToken, string> {
  const brand = light.saffron;
  const tint = parseColor(brand) ? toHsl(parseColor(brand)!).h : 30;
  const neutral = (l: number, s = 0.08) => toHex(fromHsl({ h: tint, s, l }));
  const surface = neutral(0.1);

  const lift = (color: string) => {
    let out = color;
    for (let i = 0; i < 20 && contrast(out, surface) < 4.5; i += 1) out = adjust(out, { l: 0.04 });
    return out;
  };

  return {
    ...light,
    ...brandScale(brand, surface),
    white: surface,
    canvas: neutral(0.07),
    fill: neutral(0.16),
    ink: neutral(0.95, 0.1),
    body: neutral(0.85),
    muted: neutral(0.68),
    subtle: neutral(0.52),
    border: neutral(0.22),
    divider: neutral(0.18),
    hairline: 'rgba(255,255,255,0.08)',
    green: lift(light.green),
    greenSoft: mix(surface, light.green, 0.2),
    red: lift(light.red),
    redSoft: mix(surface, light.red, 0.2),
    shadow: '#000000',
    overlay: 'rgba(0,0,0,0.6)',
    transparent: 'transparent',
  };
}

/** Hues that sit well with `base`, for the harmony suggestions. */
export function harmonies(base: string): { name: string; colors: string[] }[] {
  const shift = (deg: number) => adjust(base, { h: deg });
  return [
    { name: 'Complementary', colors: [base, shift(180)] },
    { name: 'Analogous', colors: [shift(-30), base, shift(30)] },
    { name: 'Triadic', colors: [base, shift(120), shift(240)] },
    { name: 'Split', colors: [base, shift(150), shift(210)] },
    { name: 'Tints', colors: [adjust(base, { l: 0.25 }), adjust(base, { l: 0.12 }), base, adjust(base, { l: -0.12 })] },
  ];
}

/** A random brand colour that is saturated and mid-light enough to press. */
export function randomBrand(seed = Math.random()): string {
  const h = Math.floor(seed * 360);
  const s = 0.62 + ((seed * 7) % 1) * 0.3;
  const l = 0.46 + ((seed * 13) % 1) * 0.12;
  return toHex(fromHsl({ h, s, l }));
}
