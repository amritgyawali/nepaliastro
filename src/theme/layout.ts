import { Platform, StyleSheet, type ViewStyle } from 'react-native';

/** Phone-shaped canvas: on a wide window the app is centred at this width. */
export const SCREEN_MAX_WIDTH = 430;

/** Side margin shared by every screen, so nothing sits on its own grid. */
export const GUTTER = 20;

/** Height of the bottom tab bar, excluding the safe-area inset. */
export const TAB_BAR_HEIGHT = 58;

/** Minimum comfortable target for anything tappable. */
export const TOUCH_SIZE = 44;

/** One spacing scale. Multiples of four, four steps, no in-between values. */
export const space = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  pill: 999,
} as const;

/**
 * Cross-platform elevation.
 *
 * Cards are drawn with a border first and a shadow only where something
 * genuinely floats above the page, so this stays deliberately shallow.
 *
 * react-native-web does not honour the iOS `shadow*` props and Android only
 * understands `elevation`, so each platform gets the form it renders.
 */
export function shadow(
  elevation: number,
  opacity = 0.08,
  blur = elevation * 2,
  offsetY = elevation,
): ViewStyle {
  if (Platform.OS === 'web') {
    return { boxShadow: `0px ${offsetY}px ${blur}px rgba(0,0,0,${opacity})` } as ViewStyle;
  }
  if (Platform.OS === 'android') {
    return { elevation };
  }
  return {
    shadowColor: '#000',
    shadowOpacity: opacity,
    shadowRadius: blur,
    shadowOffset: { width: 0, height: offsetY },
  };
}

export const hairlineWidth = StyleSheet.hairlineWidth;
