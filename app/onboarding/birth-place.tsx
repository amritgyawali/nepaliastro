import { useRouter } from 'expo-router';
import React from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { NavHeader, PrimaryButton, Screen, Stepper } from '@/components';
import { useOnboarding } from '@/store/onboarding';
import { GUTTER, colors, radius, space, type } from '@/theme';

/** Step 5 — "Where were you born?" */
export default function BirthPlaceStep() {
  const router = useRouter();
  const { profile, update } = useOnboarding();

  const canContinue = profile.birthPlace.trim().length > 0;

  return (
    <Screen background={colors.white}>
      <NavHeader title="Your details" bordered />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.body}
      >
        <View style={styles.content}>
          <Stepper current="birth-place" />

          <Text style={styles.heading}>Where were you born?</Text>
          <Text style={styles.hint}>
            The place fixes your chart's timings, so the nearest city is enough.
          </Text>

          <TextInput
            value={profile.birthPlace}
            onChangeText={(birthPlace) => update({ birthPlace })}
            placeholder="City, region, country"
            placeholderTextColor={colors.subtle}
            style={styles.input}
            autoCapitalize="words"
            autoCorrect={false}
            returnKeyType="next"
            accessibilityLabel="City or region of birth"
            onSubmitEditing={() => canContinue && router.push('/onboarding/languages')}
          />

          <View style={styles.spacer} />

          <PrimaryButton
            label="Continue"
            disabled={!canContinue}
            onPress={() => router.push('/onboarding/languages')}
          />
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
  },
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
  },
  hint: {
    ...type.body,
    color: colors.muted,
    marginTop: space.xs,
    marginBottom: space.xl,
  },
  input: {
    height: 52,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    paddingHorizontal: space.lg,
    ...type.body,
    color: colors.ink,
  },
  spacer: {
    flex: 1,
    minHeight: space.xl,
  },
});
