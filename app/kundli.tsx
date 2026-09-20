import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { NavHeader, PrimaryButton, Screen } from '@/components';
import { formatBirthMoment, kundliFor } from '@/lib/kundli';
import { useOnboarding } from '@/store/onboarding';
import { GUTTER, colors, radius, space, type } from '@/theme';

/** Your birth chart, as far as it can honestly be computed on the device. */
export default function KundliScreen() {
  const router = useRouter();
  const { profile } = useOnboarding();

  const kundli = useMemo(() => kundliFor(profile), [profile]);

  if (!kundli) {
    return (
      <Screen background={colors.white}>
        <NavHeader title="Your kundli" bordered />
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>We need your birth details first</Text>
          <Text style={styles.emptyBody}>
            A chart is built from the date, time and place you were born. Add them and
            this screen fills in.
          </Text>
          <PrimaryButton
            label="Add birth details"
            onPress={() => router.push('/onboarding/name')}
            style={styles.emptyCta}
          />
        </View>
      </Screen>
    );
  }

  const rows = [
    {
      label: 'Rashi (moon sign)',
      value: `${kundli.rashi.vedic} · ${kundli.rashi.western}`,
      note: `Ruled by ${kundli.rashi.lord}`,
    },
    {
      label: 'Nakshatra',
      value: `${kundli.nakshatra.name}`,
      note: `Pada ${kundli.nakshatra.pada}`,
    },
    {
      label: 'Sun sign (sidereal)',
      value: `${kundli.sunRashi.vedic} · ${kundli.sunRashi.western}`,
      note: 'Vedic charts use the sidereal zodiac, so this can differ by a sign from the one you know',
    },
    {
      label: 'Lagna (rising sign)',
      value: kundli.lagna ? `${kundli.lagna.vedic} · ${kundli.lagna.western}` : 'Needs your birth time',
      note: kundli.lagna
        ? 'Estimated — roughly two hours per sign from sunrise'
        : 'Add an exact birth time and this can be estimated',
    },
    {
      label: 'Tithi at birth',
      value: `${kundli.tithi.paksha} ${kundli.tithi.name}`,
      note: `Lunar day ${kundli.tithi.index} of 30`,
    },
    { label: 'Vara (weekday)', value: kundli.vara, note: 'The day you were born' },
  ];

  return (
    <Screen background={colors.white}>
      <NavHeader title="Your kundli" bordered />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.birth}>
          <Text style={styles.birthLabel}>Born</Text>
          <Text style={styles.birthValue}>{formatBirthMoment(kundli.moment)}</Text>
          <Text style={styles.birthPlace}>{kundli.moment.place}</Text>
        </View>

        <View style={styles.card}>
          {rows.map((row, index) => (
            <View key={row.label} style={[styles.row, index > 0 && styles.rowDivider]}>
              <Text style={styles.rowLabel}>{row.label}</Text>
              <Text style={styles.rowValue}>{row.value}</Text>
              <Text style={styles.rowNote}>{row.note}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.note}>
          Everything above follows from the sun and moon positions for your birth moment,
          computed on the device. The other seven grahas, the house cusps and the dashas
          need a full ephemeris — that is what an astrologer brings to a consultation.
        </Text>

        <View style={styles.actions}>
          <PrimaryButton
            label="Ask an astrologer to read it"
            onPress={() => router.push('/(tabs)/chat')}
          />
          <PrimaryButton
            label="Edit birth details"
            variant="outline"
            onPress={() => router.push('/onboarding/name')}
          />
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: GUTTER,
    paddingTop: space.lg,
    paddingBottom: space.xxl,
  },
  birth: {
    padding: space.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.saffronSoft,
    borderWidth: 1,
    borderColor: colors.saffronBorder,
  },
  birthLabel: {
    ...type.caption,
    color: colors.saffronDeep,
  },
  birthValue: {
    ...type.section,
    color: colors.ink,
  },
  birthPlace: {
    ...type.small,
    color: colors.muted,
  },
  card: {
    marginTop: space.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  row: {
    paddingHorizontal: space.lg,
    paddingVertical: space.md,
    gap: 1,
  },
  rowDivider: {
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  rowLabel: {
    ...type.caption,
    color: colors.muted,
  },
  rowValue: {
    ...type.section,
    color: colors.ink,
  },
  rowNote: {
    ...type.small,
    color: colors.muted,
  },
  note: {
    ...type.small,
    color: colors.muted,
    marginTop: space.lg,
  },
  actions: {
    marginTop: space.xl,
    gap: space.md,
  },
  empty: {
    paddingHorizontal: GUTTER,
    paddingTop: space.xxl,
  },
  emptyTitle: {
    ...type.section,
    color: colors.ink,
  },
  emptyBody: {
    ...type.body,
    color: colors.muted,
    marginTop: space.sm,
  },
  emptyCta: {
    marginTop: space.xl,
  },
});
