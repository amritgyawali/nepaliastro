import React, { useState } from 'react';
import {
  Pressable,
  type GestureResponderEvent,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { motion } from '@/theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type Feel = keyof typeof motion.pressScale;

export type TappableProps = Omit<PressableProps, 'style' | 'children'> & {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  /** Added while a finger (or the mouse button) is down. */
  pressedStyle?: StyleProp<ViewStyle>;
  /** Added while a pointer hovers, on web. */
  hoveredStyle?: StyleProp<ViewStyle>;
  /** How far the surface sinks: a button more, a whole card less. */
  feel?: Feel;
};

/**
 * Anything that can be pressed and is bigger than a line of text.
 *
 * It sinks a few percent under the finger on a spring and comes back when
 * released, so a tap is felt before the next screen arrives. The scale runs
 * on the UI thread; the pressed and hovered styles are plain React state, so
 * a colour change reads exactly as it did with a bare Pressable. With
 * reduced motion on, only the colour change is left.
 */
export function Tappable({
  children,
  style,
  pressedStyle,
  hoveredStyle,
  feel = 'button',
  disabled,
  onPressIn,
  onPressOut,
  onHoverIn,
  onHoverOut,
  ...rest
}: TappableProps) {
  const reduceMotion = useReducedMotion();
  const depth = useSharedValue(0);
  const [pressed, setPressed] = useState(false);
  const [hovered, setHovered] = useState(false);
  const scaleTo = motion.pressScale[feel];

  const sink = useAnimatedStyle(() => ({
    transform: [{ scale: 1 - depth.value * (1 - scaleTo) }],
  }));

  const handlePressIn = (event: GestureResponderEvent) => {
    setPressed(true);
    if (!reduceMotion) depth.value = withSpring(1, motion.pressSpring);
    onPressIn?.(event);
  };

  const handlePressOut = (event: GestureResponderEvent) => {
    setPressed(false);
    depth.value = reduceMotion ? 0 : withSpring(0, motion.pressSpring);
    onPressOut?.(event);
  };

  return (
    <AnimatedPressable
      {...rest}
      disabled={disabled}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onHoverIn={(event) => {
        setHovered(true);
        onHoverIn?.(event);
      }}
      onHoverOut={(event) => {
        setHovered(false);
        onHoverOut?.(event);
      }}
      style={[
        style,
        hovered && !disabled && hoveredStyle,
        pressed && pressedStyle,
        sink,
      ]}
    >
      {children}
    </AnimatedPressable>
  );
}
