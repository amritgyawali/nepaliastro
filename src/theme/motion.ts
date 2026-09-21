import { Easing } from 'react-native-reanimated';

/**
 * Motion tokens.
 *
 * Movement in this app answers a touch; it never decorates. A press sinks a
 * surface a few percent, a link draws its underline, a section settles into
 * place once when a screen opens. Nothing loops, bounces for attention or
 * moves on its own. Every animation goes through these values, and every one
 * of them is skipped when the system asks for reduced motion.
 */
export const motion = {
  /** How far a pressed surface sinks. Cards move less than buttons. */
  pressScale: {
    button: 0.97,
    card: 0.985,
    icon: 0.9,
  },
  /** Press in and release: quick, settled, no overshoot to speak of. */
  pressSpring: { damping: 22, stiffness: 420, mass: 0.6 },
  /** A link's underline and arrow. */
  link: { duration: 180, easing: Easing.out(Easing.quad) },
  /** A section settling into place when a screen first opens. */
  reveal: { duration: 320, offset: 8, stagger: 45, maxDelay: 360 },
  /** The tab icon's small lift when it becomes the current one. */
  tabSpring: { damping: 12, stiffness: 320, mass: 0.5 },
} as const;
