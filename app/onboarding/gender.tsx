import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { NavHeader, PrimaryButton, Screen, Stepper } from '@/components';
import { FemaleFigure, MaleFigure } from '@/icons';
import { useOnboarding, type Gender } from '@/store/onboarding';
import { GUTTER, colors, radius, space, type } from '@/theme';

const OPTIONS: { value: Gender; label: string; Figure: typeof MaleFigure }[] = [
  { value: 'male', label: 'Male', Figure: MaleFigure },
  { value: 'female', label: 'Female', Figure: FemaleFigure },
];

/** Step 2 — gender. */
export default function GenderStep() {
  const router = useRouter();
  const { profile, update } = useOnboarding();

  return (
    <Screen background={colors.white}>
      <NavHeader title="Your details" bordered />

      <View style={styles.content}>
        <Stepper current="gender" />

        <Text style={styles.heading}>What is your gender?</Text>

        <View
          style={styles.options}
          accessibilityRole="radiogroup"
          accessibilityLabel="Select your gender"
        >
          {OPTIONS.map(({ value, label, Figure }) => {
            const selected = profile.gender === value;

            return (
              <Pressable
                key={value}
                accessibilityRole="radio"
                accessibilityState={{ selected }}
                accessibilityLabel={label}
                onPress={() => update({ gender: value })}
                style={({ pressed }) => [
                  styles.option,
                  selected && styles.optionSelected,
                  pressed && styles.pressed,
                ]}
              >
                <Figure size={44} color={selected ? colors.saffronDeep : colors.muted} />
                <Text style={[styles.label, selected && styles.labelSelected]}>
                  {label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.spacer} />

        <PrimaryButton
          label="Continue"
          disabled={!profile.gender}
          onPress={() => router.push('/onboarding/birth-date')}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingHorizontal: GUTTER,
    paddingTop: space.xl,
    paddingBottom: space.xl,
  },
  heading: {
    ...type.display,
    color: colors.ink,
    marginTop: space.xl,
    marginBottom: space.xl,
  },
  options: {
    flexDirection: 'row',
    gap: space.md,
  },
  option: {
    flex: 1,
    alignItems: 'center',
    gap: space.sm,
    paddingVertical: space.xl,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
  optionSelected: {
    borderColor: colors.saffron,
    backgroundColor: colors.saffronSoft,
  },
  pressed: {
    opacity: 0.7,
  },
  label: {
    ...type.label,
    color: colors.body,
  },
  labelSelected: {
    color: colors.saffronDeep,
  },
  spacer: {
    flex: 1,
    minHeight: space.xl,
  },
});
