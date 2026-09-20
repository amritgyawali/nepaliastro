import { Easing, Platform } from 'react-native';

/**
 * Motion tokens.
 *
 * The app animates with React Native's own `Animated` API rather than a
 * gesture library, so everything here is expressed in the terms that API
 * takes. `NATIVE_DRIVER` is false on web, where the native driver is not
 * implemented, and true everywhere else.
 */
export const NATIVE_DRIVER = Platform.OS !== 'web';

export const duration = {
  /** Press feedback, chip toggles. */
  instant: 110,
  /** Bars filling, fades between states. */
  quick: 180,
  /** Header chrome appearing, CTA docking. */
  base: 260,
  /** Carousel auto-advance cross-fades, shimmer. */
  slow: 420,
} as const;

/** Standard ease for anything entering or moving under its own steam. */
export const easing = {
  standard: Easing.bezier(0.2, 0, 0, 1),
  decelerate: Easing.out(Easing.cubic),
  accelerate: Easing.in(Easing.cubic),
} as const;

/** Spring used for press feedback — tight, no visible wobble. */
export const pressSpring = {
  damping: 18,
  stiffness: 320,
  mass: 0.6,
} as const;
