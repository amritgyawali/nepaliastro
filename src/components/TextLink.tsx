import React from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type AccessibilityState,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { ArrowRight } from '@/icons';
import { colors, motion, type } from '@/theme';

type TextLinkProps = {
  label: string;
  onPress?: () => void;
  /** Ends the label with an arrow. On for links that go somewhere, off for toggles. */
  arrow?: boolean;
  /** `accent` is saffron ink; `quiet` is body ink for a secondary link. */
  tone?: 'accent' | 'quiet';
  /** `label` next to body text, `caption` inside a dense card. */
  size?: 'label' | 'caption';
  accessibilityLabel?: string;
  accessibilityState?: AccessibilityState;
  style?: StyleProp<ViewStyle>;
};

/**
 * A link that reads as a link.
 *
 * At rest it carries a hairline underline in the tint of its ink, so it is
 * never mistaken for a label. Under a finger or a pointer the underline is
 * drawn in, left to right, in the full ink colour, and the arrow steps
 * forward a few points — the direction the tap is about to take you.
 */
export function TextLink({
  label,
  onPress,
  arrow = true,
  tone = 'accent',
  size = 'label',
  accessibilityLabel,
  accessibilityState,
  style,
}: TextLinkProps) {
  const reduceMotion = useReducedMotion();
  const active = useSharedValue(0);
  const ink = tone === 'accent' ? colors.saffronDeep : colors.body;
  const rest = tone === 'accent' ? colors.saffronBorder : colors.border;

  const to = (value: number) => {
    active.value = reduceMotion ? value : withTiming(value, motion.link);
  };

  const underline = useAnimatedStyle(() => ({
    transform: [{ scaleX: active.value }],
  }));

  const nudge = useAnimatedStyle(() => ({
    transform: [{ translateX: active.value * 3 }],
  }));

  return (
    <Pressable
      accessibilityRole="link"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={accessibilityState}
      onPress={onPress}
      onPressIn={() => to(1)}
      onPressOut={() => to(0)}
      onHoverIn={() => to(1)}
      onHoverOut={() => to(0)}
      onFocus={() => to(1)}
      onBlur={() => to(0)}
      hitSlop={10}
      style={[styles.row, style]}
    >
      <View>
        <Text style={[size === 'label' ? type.label : type.caption, { color: ink }]}>
          {label}
        </Text>
        <View style={[styles.track, { backgroundColor: rest }]}>
          <Animated.View style={[styles.bar, { backgroundColor: ink }, underline]} />
        </View>
      </View>

      {arrow ? (
        <Animated.View style={nudge}>
          <ArrowRight size={size === 'label' ? 15 : 13} color={ink} strokeWidth={2.2} />
        </Animated.View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 4,
  },
  track: {
    height: 1.5,
    marginTop: -1,
    borderRadius: 1,
    overflow: 'hidden',
  },
  bar: {
    flex: 1,
    transformOrigin: 'left',
  },
});
