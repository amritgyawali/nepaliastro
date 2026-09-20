import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

import { ChatDots, Phone } from '@/icons';
import {
  NATIVE_DRIVER,
  SCREEN_MAX_WIDTH,
  colors,
  duration,
  easing,
  fontFamily,
  radius,
  shadow,
  weight,
} from '@/theme';

import { useReduceMotion } from '@/hooks/useReduceMotion';
import { PressableScale } from '../PressableScale';

type ConsultCTAsProps = {
  onChat?: () => void;
  onCall?: () => void;
  /** Distance from the bottom of the screen, i.e. clear of the tab bar. */
  bottom: number;
  /** Drop the bar out of the way — set while the reader is scrolling down. */
  hidden?: boolean;
};

/**
 * The blue/yellow pair of consultation buttons floating above the tab bar.
 *
 * The bar covers two rows of the feed, so it steps out of the way while the
 * reader is moving down the page and returns the moment they scroll back,
 * reach the end, or lift their finger. It is removed from the accessibility
 * tree and from hit testing while it is away, never merely faded.
 */
export function ConsultCTAs({ onChat, onCall, bottom, hidden = false }: ConsultCTAsProps) {
  const reduceMotion = useReduceMotion();
  const offset = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const toValue = hidden ? 1 : 0;
    if (reduceMotion) {
      offset.setValue(toValue);
      return;
    }
    const animation = Animated.timing(offset, {
      toValue,
      duration: duration.base,
      easing: hidden ? easing.accelerate : easing.decelerate,
      useNativeDriver: NATIVE_DRIVER,
    });
    animation.start();
    return () => animation.stop();
  }, [hidden, offset, reduceMotion]);

  return (
    <Animated.View
      style={[
        styles.wrapper,
        {
          bottom,
          opacity: offset.interpolate({ inputRange: [0, 1], outputRange: [1, 0] }),
          transform: [
            {
              translateY: offset.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 130],
              }),
            },
          ],
        },
      ]}
      pointerEvents={hidden ? 'none' : 'box-none'}
      accessibilityElementsHidden={hidden}
      importantForAccessibility={hidden ? 'no-hide-descendants' : 'auto'}
    >
      <View style={styles.row}>
        <PressableScale
          accessibilityRole="button"
          accessibilityLabel="Chat with an astrologer"
          onPress={onChat}
          scaleTo={0.97}
          containerStyle={styles.half}
          style={[styles.button, styles.chat]}
        >
          <ChatDots size={18} color={colors.white} filled />
          <Text style={[styles.label, styles.chatLabel]}>Chat with Astrologer</Text>
        </PressableScale>

        <PressableScale
          accessibilityRole="button"
          accessibilityLabel="Call an astrologer"
          onPress={onCall}
          scaleTo={0.97}
          containerStyle={styles.half}
          style={[styles.button, styles.call]}
        >
          <Phone size={17} color="#111111" filled />
          <Text style={[styles.label, styles.callLabel]}>Call with Astrologer</Text>
        </PressableScale>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: 14,
  },
  row: {
    width: '100%',
    maxWidth: SCREEN_MAX_WIDTH - 28,
    flexDirection: 'row',
    gap: 10,
  },
  half: {
    flex: 1,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: radius.pill,
    ...shadow(5, 0.18, 14),
  },
  chat: {
    backgroundColor: colors.blueCta,
  },
  call: {
    backgroundColor: '#F2DE4E',
  },
  label: {
    fontFamily,
    fontSize: 13,
    fontWeight: weight.bold,
    letterSpacing: -0.2,
  },
  chatLabel: {
    color: colors.white,
  },
  callLabel: {
    color: '#111111',
  },
});
