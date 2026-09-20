import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { NavHeader, PrimaryButton, Screen, Stepper } from '@/components';
import { languageOptions } from '@/data/content';
import { useOnboarding } from '@/store/onboarding';
import { GUTTER, colors, font, radius, space, type } from '@/theme';

/** Step 6 — the languages you want to be read in. */
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
      <NavHeader title="Your details" bordered />

      <View style={styles.content}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <Stepper current="languages" />

          <Text style={styles.heading}>Which languages do you read in?</Text>
          <Text style={styles.hint}>Pick as many as you like.</Text>

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
                    pressed && styles.pressed,
                  ]}
                >
                  <Text
                    style={[styles.chipLabel, selected && styles.chipLabelSelected]}
                    numberOfLines={1}
                  >
                    {language}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </ScrollView>

        <PrimaryButton label="Finish" disabled={!canContinue} onPress={finish} />
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
  scroll: {
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
    marginBottom: space.lg,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: space.sm,
  },
  chip: {
    paddingHorizontal: space.lg,
    paddingVertical: space.md,
    borderRadius: radius.pill,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipSelected: {
    backgroundColor: colors.saffronSoft,
    borderColor: colors.saffron,
  },
  pressed: {
    opacity: 0.6,
  },
  chipLabel: {
    ...type.label,
    color: colors.body,
  },
  chipLabelSelected: {
    fontFamily: font.semibold,
    color: colors.saffronDeep,
  },
});
