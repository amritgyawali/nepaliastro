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

/** Step 1 — your name. */
export default function NameStep() {
  const router = useRouter();
  const { profile, update } = useOnboarding();

  const canContinue = profile.name.trim().length > 0;
  const next = () => router.push('/onboarding/gender');

  return (
    <Screen background={colors.white}>
      <NavHeader title="Your details" bordered onBack={() => router.replace('/')} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.body}
      >
        <View style={styles.content}>
          <Stepper current="name" />

          <Text style={styles.heading}>What is your name?</Text>
          <Text style={styles.hint}>
            Your astrologer will use it when they open your chart.
          </Text>

          <TextInput
            value={profile.name}
            onChangeText={(name) => update({ name })}
            placeholder="Your name"
            placeholderTextColor={colors.subtle}
            style={styles.input}
            autoCapitalize="words"
            autoCorrect={false}
            returnKeyType="next"
            accessibilityLabel="Your name"
            onSubmitEditing={() => canContinue && next()}
          />

          <View style={styles.spacer} />

          <PrimaryButton label="Continue" arrow disabled={!canContinue} onPress={next} />
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
