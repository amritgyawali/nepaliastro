import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { NavHeader, PrimaryButton, Screen, Stepper } from '@/components';
import { languageOptions } from '@/data/content';
import { Check } from '@/icons';
import { colors, fontFamily, radius, shadow, weight } from '@/theme';
import { useOnboarding } from '@/store/onboarding';

/** Step 6 — "Select all your languages?" */
export default function LanguagesStep() {
  const router = useRouter();
  const { profile, toggleLanguage, complete } = useOnboarding();

  const canContinue = profile.languages.length > 0;

  const finish = () => {
    complete();
    router.replace('/(tabs)');
  };

  return (
    <Screen background={colors.white}>
      <NavHeader title="Enter your details" bordered />

      <View style={styles.body}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <Stepper current="languages" />

          <Text style={styles.heading}>Select all your languages?</Text>

          <View style={styles.grid}>
            {languageOptions.map((language) => {
              const selected = profile.languages.includes(language);
              return (
                <Pressable
                  key={language}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: selected }}
                  accessibilityLabel={language}
                  onPress={() => toggleLanguage(language)}
                  style={({ pressed }) => [
                    styles.chip,
                    selected && styles.chipSelected,
                    pressed && styles.chipPressed,
                  ]}
                >
                  <Text
                    style={[styles.chipLabel, selected && styles.chipLabelSelected]}
                    numberOfLines={1}
                  >
                    {language}
                  </Text>
                  {selected ? (
                    <Check size={14} color="#1E2125" strokeWidth={3.2} />
                  ) : (
                    <Text style={styles.chipPlus}>+</Text>
                  )}
                </Pressable>
              );
            })}
          </View>

          <PrimaryButton
            label="Start Chat with Astrologer"
            disabled={!canContinue}
            onPress={finish}
            style={styles.cta}
          />
        </ScrollView>
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
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  heading: {
    fontFamily,
    fontSize: 25,
    lineHeight: 32,
    fontWeight: weight.medium,
    letterSpacing: -0.5,
    color: '#40444C',
    marginTop: 30,
    marginBottom: 24,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  chip: {
    // Three per row, accounting for the 10pt gaps.
    width: '31.5%',
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.white,
    ...shadow(1, 0.03),
  },
  chipSelected: {
    backgroundColor: '#F3D429',
    borderColor: '#E7C823',
  },
  chipPressed: {
    transform: [{ scale: 0.96 }],
  },
  chipLabel: {
    fontFamily,
    fontSize: 14.5,
    color: '#666B72',
    flexShrink: 1,
  },
  chipLabelSelected: {
    color: '#1E2125',
    fontWeight: weight.medium,
  },
  chipPlus: {
    fontFamily,
    fontSize: 17,
    lineHeight: 18,
    color: '#7C8086',
  },
  cta: {
    marginTop: 32,
    height: 50,
  },
});
