import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors, radius, space, type } from '@/theme';

/** The six onboarding steps, in the order they are asked. */
export const ONBOARDING_STEPS = [
  'name',
  'gender',
  'birth-date',
  'birth-time',
  'birth-place',
  'languages',
] as const;

export type OnboardingStepKey = (typeof ONBOARDING_STEPS)[number];

/**
 * Onboarding progress: how far along, in words and in one bar.
 *
 * Six icon dots told the reader there were six steps but never which one
 * they were on; "Step 3 of 6" says both, and reads out loud correctly.
 */
export function Stepper({ current }: { current: OnboardingStepKey }) {
  const index = ONBOARDING_STEPS.indexOf(current);
  const step = index + 1;
  const total = ONBOARDING_STEPS.length;

  return (
    <View
      style={styles.root}
      accessibilityRole="progressbar"
      accessibilityLabel={`Step ${step} of ${total}`}
      accessibilityValue={{ min: 1, max: total, now: step }}
    >
      <Text style={styles.label}>
        Step {step} of {total}
      </Text>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${(step / total) * 100}%` }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: space.sm,
  },
  label: {
    ...type.caption,
    color: colors.muted,
  },
  track: {
    height: 4,
    borderRadius: radius.pill,
    backgroundColor: colors.divider,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: radius.pill,
    backgroundColor: colors.saffron,
  },
});
