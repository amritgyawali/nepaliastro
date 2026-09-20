import React, { useRef } from 'react';
import {
  Animated,
  Pressable,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { useReduceMotion } from '@/hooks/useReduceMotion';
import { NATIVE_DRIVER, pressSpring } from '@/theme';

type PressableScaleProps = Omit<PressableProps, 'style'> & {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  /** How far the target shrinks while held. Larger surfaces need less. */
  scaleTo?: number;
  /** Dim as well as shrink — used on flat rows that have no shadow. */
  dim?: boolean;
};

/**
 * A Pressable that springs down while held.
 *
 * Touch feedback on the home screen is the same everywhere: a short,
 * non-wobbly scale that tracks the finger. Keeping it in one component means
 * the cards, chips and circles all respond identically, and that they all
 * respect "Reduce Motion" in one place.
 */
export function PressableScale({
  children,
  style,
  scaleTo = 0.96,
  dim = false,
  ...rest
}: PressableScaleProps) {
  const reduceMotion = useReduceMotion();
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  const animate = (toScale: number, toOpacity: number) => {
    if (reduceMotion) {
      scale.setValue(1);
      opacity.setValue(toOpacity);
      return;
    }
    Animated.parallel([
      Animated.spring(scale, {
        toValue: toScale,
        useNativeDriver: NATIVE_DRIVER,
        ...pressSpring,
      }),
      Animated.spring(opacity, {
        toValue: toOpacity,
        useNativeDriver: NATIVE_DRIVER,
        ...pressSpring,
      }),
    ]).start();
  };

  return (
    <Pressable
      {...rest}
      onPressIn={(event) => {
        animate(scaleTo, dim ? 0.7 : 0.92);
        rest.onPressIn?.(event);
      }}
      onPressOut={(event) => {
        animate(1, 1);
        rest.onPressOut?.(event);
      }}
    >
      <Animated.View style={[style, { opacity, transform: [{ scale }] }]}>
        {children}
      </Animated.View>
    </Pressable>
  );
}
