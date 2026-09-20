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
import { Search } from '@/icons';
import { colors, fontFamily, radius, weight } from '@/theme';
import { useOnboarding } from '@/store/onboarding';

/** Step 5 — "Where were you born?" */
export default function BirthPlaceStep() {
  const router = useRouter();
  const { profile, update } = useOnboarding();

  const canContinue = profile.birthPlace.trim().length > 0;

  return (
    <Screen background={colors.white}>
      <NavHeader title="Enter your details" bordered />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.body}
      >
        <View style={styles.content}>
          <Stepper current="birth-place" />

          <Text style={styles.heading}>Where were you born?</Text>

          <View style={styles.inputWrap}>
            <TextInput
              value={profile.birthPlace}
              onChangeText={(birthPlace) => update({ birthPlace })}
              placeholder="City, region, country"
              placeholderTextColor="#A8ACB1"
              style={styles.input}
              autoCapitalize="words"
              autoCorrect={false}
              returnKeyType="next"
              accessibilityLabel="City or region of birth"
              onSubmitEditing={() => canContinue && router.push('/onboarding/languages')}
            />
            <View style={styles.inputIcon} pointerEvents="none">
              <Search size={20} color="#9AA0A6" strokeWidth={2} />
            </View>
          </View>

          <PrimaryButton
            label="Next"
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
    backgroundColor: colors.cream,
  },
  content: {
    flex: 1,
    paddingHorizontal: 22,
    paddingTop: 20,
  },
  heading: {
    fontFamily,
    fontSize: 27,
    lineHeight: 34,
    fontWeight: weight.semibold,
    letterSpacing: -0.5,
    color: '#434A54',
    marginTop: 38,
    marginBottom: 32,
  },
  inputWrap: {
    marginBottom: 26,
    justifyContent: 'center',
  },
  input: {
    height: 56,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    backgroundColor: colors.white,
    paddingLeft: 16,
    paddingRight: 48,
    fontFamily,
    fontSize: 17,
    color: colors.ink,
  },
  inputIcon: {
    position: 'absolute',
    right: 16,
  },
});
