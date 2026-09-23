import { StyleSheet } from 'react-native';

import { colors } from './colors';
import { GUTTER, SCREEN_MAX_WIDTH, TAB_BAR_HEIGHT, TOUCH_SIZE, radius, space } from './layout';
import { type } from './typography';

/**
 * The theme, live.
 *
 * The tokens in this folder are the defaults. When the admin dashboard
 * publishes a theme, `src/config/apply.ts` writes it over those same objects
 * and calls `bumpTheme()`. Two things then carry it to the screen:
 *
 * - `themedStyles`, which every `StyleSheet.create` in the app is compiled
 *   into (see `babel/themed-styles.js`). It rebuilds a stylesheet the first
 *   time one of its styles is read after the version moved on.
 * - `liveLayout`, which reads of `GUTTER` and friends are compiled into, so a
 *   changed gutter arrives the same way a changed colour does.
 *
 * Neither makes a mounted component re-render by itself. The app remounts its
 * navigator on every publish (`app/_layout.tsx`), and the fresh render is what
 * picks the new values up.
 */

let version = 0;
let textScale = 1;

/** Increments on every published theme; stylesheets compare against it. */
export function themeVersion(): number {
  return version;
}

/** Marks every stylesheet stale, so the next read rebuilds it. */
export function bumpTheme(): void {
  version += 1;
}

/**
 * Multiplies every `fontSize` and `lineHeight` in every app stylesheet —
 * including the ones set outside the type scale — so a larger-text setting
 * reaches the whole app rather than only the named steps.
 */
export function setTextScale(scale: number): void {
  textScale = Number.isFinite(scale) && scale > 0 ? scale : 1;
}

export function currentTextScale(): number {
  return textScale;
}

/** The four layout numbers that are read as constants across the app. */
export const liveLayout = {
  GUTTER,
  SCREEN_MAX_WIDTH,
  TAB_BAR_HEIGHT,
  TOUCH_SIZE,
};

export type LiveLayout = typeof liveLayout;

/**
 * The shipped values of every token, copied before anything can overwrite
 * them. "Reset to default" in the dashboard reads from here.
 */
export const themeDefaults = {
  colors: { ...colors },
  type: Object.fromEntries(
    Object.entries(type).map(([step, style]) => [step, { ...style }]),
  ) as { [K in keyof typeof type]: (typeof type)[K] },
  space: { ...space },
  radius: { ...radius },
  layout: { ...liveLayout },
};

function scaleText<T extends object>(styles: T): T {
  if (textScale === 1) return styles;
  const scaled: Record<string, unknown> = {};
  for (const [name, style] of Object.entries(styles)) {
    if (!style || typeof style !== 'object') {
      scaled[name] = style;
      continue;
    }
    const next = { ...(style as Record<string, unknown>) };
    if (typeof next.fontSize === 'number') next.fontSize = round(next.fontSize * textScale);
    if (typeof next.lineHeight === 'number') next.lineHeight = round(next.lineHeight * textScale);
    scaled[name] = next;
  }
  return scaled as T;
}

function round(value: number): number {
  return Math.round(value * 2) / 2;
}

/**
 * A stylesheet that follows the theme.
 *
 * Built straight away, exactly as `StyleSheet.create` would, then rebuilt
 * lazily on the first read after `bumpTheme()`. On web the rebuilt styles go
 * through `StyleSheet.create` too, so react-native-web still compiles them to
 * classes rather than falling back to inline styles.
 */
export function themedStyles<T extends object>(factory: () => T): T {
  let built = -1;
  let current = {} as T;

  const fresh = (): T => {
    if (built !== version) {
      current = StyleSheet.create(scaleText(factory()) as never) as T;
      built = version;
    }
    return current;
  };

  fresh();

  // The target stays an empty object: the real styles are swapped out
  // underneath it, and a Proxy may not report a different value for a frozen
  // property of its own target.
  return new Proxy({} as T, {
    get: (_target, key) => (fresh() as Record<PropertyKey, unknown>)[key],
    has: (_target, key) => key in fresh(),
    ownKeys: () => Reflect.ownKeys(fresh()),
    getOwnPropertyDescriptor: (_target, key) => {
      const styles = fresh() as Record<PropertyKey, unknown>;
      if (!(key in styles)) return undefined;
      return { configurable: true, enumerable: true, writable: false, value: styles[key] };
    },
  });
}
