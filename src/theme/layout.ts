import { Platform, StyleSheet, type ViewStyle } from 'react-native';

/** The reference designs are drawn for a 430pt-wide iPhone canvas. */
export const SCREEN_MAX_WIDTH = 430;

/** Height of the floating pill tab bar, excluding the safe-area inset. */
export const TAB_BAR_HEIGHT = 64;

export const radius = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 18,
  xxl: 22,
  pill: 999,
} as const;

/**
 * Cross-platform elevation.
 *
 * react-native-web does not honour the iOS `shadow*` props, and Android only
 * understands `elevation`, so each platform gets the form it actually renders.
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
