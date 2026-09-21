import React, { useEffect } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

import { motion } from '@/theme';

type RevealProps = {
  children: React.ReactNode;
  /** Position in the screen's reading order; later sections arrive a beat later. */
  index?: number;
  style?: StyleProp<ViewStyle>;
};

/**
 * A section that settles into place once, when its screen opens.
 *
 * Eight points of travel and a fade, top to bottom in reading order, capped
 * so the last section is never kept waiting. It does not run again on
 * scroll, on refresh, or when data changes, and it does not run at all with
 * reduced motion on.
 *
 * This drives a shared value rather than Reanimated's `entering` layout
 * animation: on web that one is a CSS animation which never finishes if the
 * screen mounts while hidden (behind the splash, or as an inactive tab), and
 * the section is left stuck in its start position.
 */
export function Reveal({ children, index = 0, style }: RevealProps) {
  const reduceMotion = useReducedMotion();
  const { duration, offset, stagger, maxDelay } = motion.reveal;
  const shown = useSharedValue(reduceMotion ? 1 : 0);

  useEffect(() => {
    if (reduceMotion) {
      shown.value = 1;
      return;
    }
    shown.value = withDelay(
      Math.min(index * stagger, maxDelay),
      withTiming(1, { duration, easing: Easing.out(Easing.cubic) }),
    );
    // Runs once per mount by design: a section only settles in when it first appears.
  }, []);

  const settle = useAnimatedStyle(() => ({
    opacity: shown.value,
    transform: [{ translateY: (1 - shown.value) * offset }],
  }));

  return <Animated.View style={[style, settle]}>{children}</Animated.View>;
}
