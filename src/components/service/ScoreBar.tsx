import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors, radius, space, type } from '@/theme';

type ScoreBarProps = {
  /** 0–100. */
  value: number;
  label?: string;
  /** Right-hand caption, e.g. "19 / 36". */
  caption?: string;
  /** Under 40 reads as a warning; this turns that off for neutral measures. */
  neutral?: boolean;
};

/** A filled track. The only chart in the app, used everywhere a score is. */
export function ScoreBar({ value, label, caption, neutral }: ScoreBarProps) {
  const clamped = Math.max(0, Math.min(100, value));
  const fill = neutral
    ? colors.saffron
    : clamped >= 62
      ? colors.green
      : clamped >= 42
        ? colors.saffron
        : colors.red;

  return (
    <View style={styles.root}>
      {label || caption ? (
        <View style={styles.head}>
          {label ? <Text style={styles.label}>{label}</Text> : null}
          {caption ? <Text style={styles.caption}>{caption}</Text> : null}
        </View>
      ) : null}

      <View
        accessibilityRole="progressbar"
        accessibilityValue={{ min: 0, max: 100, now: Math.round(clamped) }}
        style={styles.track}
      >
        <View style={[styles.fill, { width: `${clamped}%`, backgroundColor: fill }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { gap: space.xs },
  head: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: space.sm,
  },
  label: { ...type.label, color: colors.body, flexShrink: 1 },
  caption: { ...type.caption, color: colors.muted },
  track: {
    height: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.fill,
    overflow: 'hidden',
  },
  fill: { height: '100%', borderRadius: radius.pill },
});
