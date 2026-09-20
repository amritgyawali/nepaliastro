import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { NavHeader, PrimaryButton, Screen } from '@/components';
import { formatToday, readingFor, signForDate, zodiacSigns } from '@/lib/astro';
import { useOnboarding } from '@/store/onboarding';
import { GUTTER, colors, font, radius, space, type } from '@/theme';

/** Today's reading, for your sign or any other. */
export default function HoroscopeScreen() {
  const router = useRouter();
  const { profile } = useOnboarding();

  const yourSign = useMemo(() => signForDate(profile.birthDate), [profile.birthDate]);
  const [signId, setSignId] = useState(yourSign.id);

  const sign = zodiacSigns.find((entry) => entry.id === signId) ?? yourSign;
  const now = useMemo(() => new Date(), []);
  const reading = useMemo(() => readingFor(sign, now), [sign, now]);
  const dateLabel = formatToday(now);

  return (
    <Screen background={colors.white}>
      <NavHeader title="Daily horoscope" bordered />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.date}>{dateLabel}</Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.signs}
        >
          {zodiacSigns.map((entry) => {
            const selected = entry.id === sign.id;

            return (
              <Pressable
                key={entry.id}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                accessibilityLabel={`${entry.name}${entry.id === yourSign.id ? ', your sign' : ''}`}
                onPress={() => setSignId(entry.id)}
                style={({ pressed }) => [
                  styles.sign,
                  selected && styles.signSelected,
                  pressed && styles.pressed,
                ]}
              >
                <Text
                  style={[styles.glyph, selected && styles.glyphSelected]}
                  allowFontScaling={false}
                >
                  {`${entry.glyph}︎`}
                </Text>
                <Text style={[styles.signName, selected && styles.signNameSelected]}>
                  {entry.name}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <View style={styles.card}>
          <Text style={styles.signTitle}>
            {sign.name}
            {sign.id === yourSign.id ? ' · your sign' : ''}
          </Text>
          <Text style={styles.element}>{sign.element} sign</Text>

          <Text style={styles.headline}>{reading.headline}</Text>
          <Text style={styles.body}>{reading.body}</Text>

          <View style={styles.lucky}>
            <View style={styles.luckyItem}>
              <Text style={styles.luckyLabel}>Lucky number</Text>
              <Text style={styles.luckyValue}>{reading.luckyNumber}</Text>
            </View>
            <View style={styles.luckyDivider} />
            <View style={styles.luckyItem}>
              <Text style={styles.luckyLabel}>Lucky colour</Text>
              <View style={styles.luckyColourRow}>
                <View
                  style={[styles.swatch, { backgroundColor: reading.luckyColour.hex }]}
                />
                <Text style={styles.luckyValue}>{reading.luckyColour.name}</Text>
              </View>
            </View>
          </View>
        </View>

        <Text style={styles.note}>
          The reading is written for the sign and the day, not for your chart. For
          something that takes your own birth details into account, ask an astrologer.
        </Text>

        <View style={styles.actions}>
          <PrimaryButton
            label="Ask an astrologer about this"
            onPress={() => router.push('/(tabs)/chat')}
          />
          <PrimaryButton
            label="See your kundli"
            variant="outline"
            onPress={() => router.push('/kundli')}
          />
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: space.lg,
    paddingBottom: space.xxl,
  },
  date: {
    ...type.caption,
    color: colors.muted,
    paddingHorizontal: GUTTER,
  },
  signs: {
    gap: space.sm,
    paddingHorizontal: GUTTER,
    paddingTop: space.md,
    paddingBottom: space.lg,
  },
  sign: {
    width: 76,
    alignItems: 'center',
    gap: space.xs,
    paddingVertical: space.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
  signSelected: {
    borderColor: colors.saffron,
    backgroundColor: colors.saffronSoft,
  },
  pressed: {
    opacity: 0.6,
  },
  glyph: {
    fontSize: 20,
    lineHeight: 26,
    color: colors.muted,
  },
  glyphSelected: {
    color: colors.saffronDeep,
  },
  signName: {
    ...type.caption,
    color: colors.muted,
  },
  signNameSelected: {
    fontFamily: font.semibold,
    color: colors.saffronDeep,
  },
  card: {
    marginHorizontal: GUTTER,
    padding: space.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  signTitle: {
    ...type.section,
    color: colors.ink,
  },
  element: {
    ...type.caption,
    color: colors.muted,
  },
  headline: {
    ...type.title,
    color: colors.ink,
    marginTop: space.lg,
  },
  body: {
    ...type.body,
    color: colors.body,
    marginTop: space.sm,
  },
  lucky: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: space.lg,
    paddingTop: space.md,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  luckyItem: {
    flex: 1,
    gap: 2,
  },
  luckyDivider: {
    width: 1,
    alignSelf: 'stretch',
    marginHorizontal: space.md,
    backgroundColor: colors.divider,
  },
  luckyLabel: {
    ...type.caption,
    color: colors.muted,
  },
  luckyValue: {
    ...type.label,
    color: colors.ink,
  },
  luckyColourRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
  },
  swatch: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: colors.hairline,
  },
  note: {
    ...type.small,
    color: colors.muted,
    paddingHorizontal: GUTTER,
    marginTop: space.lg,
  },
  actions: {
    paddingHorizontal: GUTTER,
    marginTop: space.xl,
    gap: space.md,
  },
});
