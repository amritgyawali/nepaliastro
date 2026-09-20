import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { NavHeader, PrimaryButton, Screen, Stepper } from '@/components';
import { FemaleFigure, MaleFigure } from '@/icons';
import { colors, fontFamily, weight } from '@/theme';
import { useOnboarding, type Gender } from '@/store/onboarding';

const OPTIONS: { value: Gender; label: string; Figure: typeof MaleFigure }[] = [
  { value: 'male', label: 'Male', Figure: MaleFigure },
  { value: 'female', label: 'Female', Figure: FemaleFigure },
];

/** Step 2 — "What is your gender?" */
export default function GenderStep() {
  const router = useRouter();
  const { profile, update } = useOnboarding();

  return (
    <Screen background={colors.white}>
      <NavHeader title="Enter your details" bordered />

      <View style={styles.body}>
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
                  style={({ pressed }) => [styles.option, pressed && styles.optionPressed]}
                >
                  <View style={[styles.circle, selected ? styles.circleOn : styles.circleOff]}>
                    <Figure size={50} color="#2D2D2D" />
                  </View>
                  <Text style={styles.label}>{label}</Text>
                </Pressable>
              );
            })}
          </View>

          <PrimaryButton
            label="Next"
            disabled={!profile.gender}
            onPress={() => router.push('/onboarding/birth-date')}
          />
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
    backgroundColor: colors.cream,
  },
  content: {
    flex: 1,
    paddingHorizontal: 22,
    paddingTop: 20,
  },
  heading: {
    fontFamily,
    fontSize: 28,
    lineHeight: 34,
    fontWeight: weight.bold,
    letterSpacing: -0.5,
    color: '#4B5047',
    marginTop: 40,
    marginBottom: 36,
  },
  options: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    marginBottom: 40,
  },
  option: {
    alignItems: 'center',
  },
  optionPressed: {
    transform: [{ scale: 0.96 }],
  },
  circle: {
    width: 92,
    height: 92,
    borderRadius: 46,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleOn: {
    backgroundColor: colors.yellow,
  },
  circleOff: {
    borderWidth: 1,
    borderColor: '#E4E1AC',
    backgroundColor: colors.transparent,
  },
  label: {
    fontFamily,
    fontSize: 15,
    fontWeight: weight.medium,
    color: '#2E312E',
    marginTop: 12,
    letterSpacing: -0.2,
  },
});
