import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { GUTTER, colors, space, type } from '@/theme';

import { PrimaryButton } from '../PrimaryButton';

type NeedsBirthProps = {
  /** What this screen would do with the details, so the ask has a reason. */
  what: string;
  /** True when the screen needs the time of birth, not just the date. */
  needsTime?: boolean;
};

/**
 * Shown where a reading cannot honestly be produced.
 *
 * It says what is missing and what it would unlock, rather than showing an
 * empty chart or filling the gap with something invented.
 */
export function NeedsBirth({ what, needsTime }: NeedsBirthProps) {
  const router = useRouter();

  return (
    <View style={styles.root}>
      <Text style={styles.title}>
        {needsTime ? 'This one needs your time of birth' : 'This one needs your birth date'}
      </Text>
      <Text style={styles.body}>{what}</Text>
      {needsTime ? (
        <Text style={styles.body}>
          The ascendant moves a whole sign every two hours, so without a time the houses
          cannot be placed. If you genuinely do not know it, the readings built on your
          moon sign — rashifal, dasha and matching — still work.
        </Text>
      ) : null}

      <PrimaryButton
        label="Add birth details"
        onPress={() => router.push('/onboarding/birth-date')}
        style={styles.button}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    paddingHorizontal: GUTTER,
    paddingTop: space.xxl,
    gap: space.md,
  },
  title: { ...type.title, color: colors.ink },
  body: { ...type.body, color: colors.muted },
  button: { marginTop: space.lg },
});
