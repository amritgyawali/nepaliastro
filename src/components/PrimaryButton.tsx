import React from 'react';
import { Pressable, StyleSheet, Text, ViewStyle } from 'react-native';

import { colors, radius, type } from '@/theme';

type PrimaryButtonProps = {
  label: string;
  onPress?: () => void;
  disabled?: boolean;
  /** `outline` is the quiet twin — same size, same target, no fill. */
  variant?: 'solid' | 'outline';
  style?: ViewStyle;
};

/** The one button shape in the app: full width, saffron, 52pt tall. */
export function PrimaryButton({
  label,
  onPress,
  disabled,
  variant = 'solid',
  style,
}: PrimaryButtonProps) {
  const outline = variant === 'outline';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        outline ? styles.outline : styles.solid,
        pressed && (outline ? styles.outlinePressed : styles.solidPressed),
        disabled && styles.disabled,
        style,
      ]}
    >
      <Text style={[styles.label, outline && styles.outlineLabel]}>{label}</Text>
    </Pressable>
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
  outlinePressed: {
    backgroundColor: colors.fill,
  },
  disabled: {
    opacity: 0.4,
  },
  label: {
    ...type.button,
    color: colors.onSaffron,
  },
  outlineLabel: {
    color: colors.body,
  },
});
