import React from 'react';
import { StyleSheet, View } from 'react-native';

import {
  Calendar,
  Clock,
  GenderPin,
  MapPin,
  MessageSquare,
  UserOutline,
} from '@/icons';
import { colors } from '@/theme';

/** The six onboarding steps, in order, with the glyph each one carries. */
export const ONBOARDING_STEPS = [
  { key: 'name', Icon: UserOutline },
  { key: 'gender', Icon: GenderPin },
  { key: 'birth-date', Icon: Calendar },
  { key: 'birth-time', Icon: Clock },
  { key: 'birth-place', Icon: MapPin },
  { key: 'languages', Icon: MessageSquare },
] as const;

export type OnboardingStepKey = (typeof ONBOARDING_STEPS)[number]['key'];

const DOT = 18;
const ACTIVE_DOT = 28;

/**
 * Progress dots shown under the nav bar during onboarding.
 *
 * Completed and upcoming steps are plain dots — yellow once passed, grey
 * otherwise — while the current step grows into a larger yellow circle that
 * carries its own icon.
 */
export function Stepper({ current }: { current: OnboardingStepKey }) {
  const currentIndex = ONBOARDING_STEPS.findIndex((step) => step.key === current);

  return (
    <View style={styles.root}>
      {ONBOARDING_STEPS.map((step, index) => {
        const isCurrent = index === currentIndex;
        const isComplete = index < currentIndex;
        const { Icon } = step;

        if (isCurrent) {
          return (
            <View key={step.key} style={[styles.dot, styles.activeDot]}>
              <Icon size={15} color={colors.body} />
            </View>
          );
        }

        return (
          <View
            key={step.key}
            style={[styles.dot, isComplete ? styles.completeDot : styles.pendingDot]}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  dot: {
    width: DOT,
    height: DOT,
    borderRadius: DOT / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeDot: {
    width: ACTIVE_DOT,
    height: ACTIVE_DOT,
    borderRadius: ACTIVE_DOT / 2,
    backgroundColor: colors.yellowDot,
  },
  completeDot: {
    backgroundColor: colors.yellowDot,
  },
  pendingDot: {
    backgroundColor: '#E3E1D6',
  },
});
