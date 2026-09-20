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
import { colors, fontFamily, radius, weight } from '@/theme';
import { useOnboarding } from '@/store/onboarding';

/** Step 1 — "Hey there! What is your name?" */
export default function NameStep() {
  const router = useRouter();
  const { profile, update } = useOnboarding();

  const canContinue = profile.name.trim().length > 0;

  return (
    <Screen background={colors.white}>
      <NavHeader title="Enter your details" bordered onBack={() => router.replace('/')} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.body}
      >
        <View style={styles.content}>
          <Stepper current="name" />

          <View style={styles.headings}>
            <Text style={styles.heading}>Hey there!</Text>
            <Text style={styles.heading}>What is your name?</Text>
          </View>

          <TextInput
            value={profile.name}
            onChangeText={(name) => update({ name })}
            placeholder="Enter your name"
            placeholderTextColor="#A8ACB1"
            style={styles.input}
            autoCapitalize="words"
            autoCorrect={false}
            returnKeyType="next"
            accessibilityLabel="Full name"
            onSubmitEditing={() => canContinue && router.push('/onboarding/gender')}
          />

          <PrimaryButton
            label="Next"
            disabled={!canContinue}
            onPress={() => router.push('/onboarding/gender')}
            style={styles.cta}
          />
        </View>
      </KeyboardAvoidingView>
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
  headings: {
    marginTop: 44,
    marginBottom: 34,
  },
  heading: {
    fontFamily,
    fontSize: 31,
    lineHeight: 40,
    fontWeight: weight.medium,
    letterSpacing: -0.6,
    color: '#484848',
  },
  input: {
    height: 58,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: '#9EA2A8',
    backgroundColor: colors.white,
    paddingHorizontal: 16,
    fontFamily,
    fontSize: 17,
    color: colors.ink,
  },
  cta: {
    marginTop: 26,
  },
});
