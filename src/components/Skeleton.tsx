import React, { useEffect, useRef } from 'react';
import { Animated, type StyleProp, type ViewStyle } from 'react-native';

import { useReduceMotion } from '@/hooks/useReduceMotion';
import { NATIVE_DRIVER, duration, easing } from '@/theme';

type SkeletonProps = {
  width: number | `${number}%`;
  height: number;
  radius?: number;
  style?: StyleProp<ViewStyle>;
};

/**
 * Placeholder block shown while a list is still loading.
 *
 * It pulses rather than sweeping a highlight across itself: opacity is the
 * one property the native driver can animate on every platform, so the
 * placeholder never competes with the scroll for the JS thread.
 */
export function Skeleton({ width, height, radius = 8, style }: SkeletonProps) {
  const reduceMotion = useReduceMotion();
  const pulse = useRef(new Animated.Value(0.45)).current;

  useEffect(() => {
    if (reduceMotion) {
      pulse.setValue(0.5);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 0.95,
          duration: duration.slow,
          easing: easing.standard,
          useNativeDriver: NATIVE_DRIVER,
        }),
        Animated.timing(pulse, {
          toValue: 0.45,
          duration: duration.slow,
          easing: easing.standard,
          useNativeDriver: NATIVE_DRIVER,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse, reduceMotion]);

  return (
    <Animated.View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[
        {
          width,
          height,
          borderRadius: radius,
          backgroundColor: '#E9E9E5',
          opacity: pulse,
        },
        style,
      ]}
    />
  );
}
