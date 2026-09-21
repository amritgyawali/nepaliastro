import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { ArrowRight } from '@/icons';
import { colors, radius, type } from '@/theme';

import { Tappable } from './Tappable';

type PrimaryButtonProps = {
  label: string;
  onPress?: () => void;
  disabled?: boolean;
  /** `outline` is the quiet twin — same size, same target, no fill. */
  variant?: 'solid' | 'outline';
  /** Ends the label with an arrow, for a button that moves you forward a step. */
  arrow?: boolean;
  /** Swaps the label for a spinner and ignores presses until it is done. */
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
};

/**
 * The one button shape in the app: full width, saffron, 52pt tall.
 *
 * It sinks under the finger and deepens its fill while held; on web a hover
 * deepens the fill too, so the pointer gets the same answer the finger does.
 */
export function PrimaryButton({
  label,
  onPress,
  disabled,
  variant = 'solid',
  arrow,
  loading,
  style,
}: PrimaryButtonProps) {
  const outline = variant === 'outline';
  const ink = outline ? colors.body : colors.onSaffron;
  const inert = disabled || loading;

  return (
    <Tappable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: !!disabled, busy: !!loading }}
      onPress={onPress}
      disabled={inert}
      style={[styles.button, outline ? styles.outline : styles.solid, disabled && styles.disabled, style]}
      hoveredStyle={outline ? styles.outlineHovered : styles.solidPressed}
      pressedStyle={outline ? styles.outlinePressed : styles.solidPressed}
    >
      {loading ? (
        <ActivityIndicator color={ink} />
      ) : (
        <View style={styles.content}>
          <Text style={[styles.label, { color: ink }]}>{label}</Text>
          {arrow ? <ArrowRight size={18} color={ink} strokeWidth={2.2} /> : null}
        </View>
      )}
    </Tappable>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 52,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  solid: {
    backgroundColor: colors.saffron,
  },
  solidPressed: {
    backgroundColor: colors.saffronPressed,
  },
  outline: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
  },
  outlineHovered: {
    borderColor: colors.subtle,
  },
  outlinePressed: {
    backgroundColor: colors.fill,
  },
  disabled: {
    opacity: 0.4,
  },
  label: {
    ...type.button,
  },
});
