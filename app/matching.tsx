import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import {
  NavHeader,
  PrimaryButton,
  Screen,
  WheelColumn,
  WheelPicker,
} from '@/components';
import { matchCharts, type MatchResult } from '@/lib/matching';
import { useOnboarding } from '@/store/onboarding';
import { GUTTER, colors, font, radius, space, type } from '@/theme';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const CURRENT_YEAR = new Date().getFullYear();
const FIRST_YEAR = CURRENT_YEAR - 100;

function daysInMonth(month: number, year: number): number {
  return new Date(year, month, 0).getDate();
}

/** Kundli matching: your chart against someone else's, on the 36-point count. */
export default function MatchingScreen() {
  const router = useRouter();
  const { profile } = useOnboarding();

  const [partnerName, setPartnerName] = useState('');
  const [partnerDate, setPartnerDate] = useState({ day: 1, month: 1, year: 2000 });
  const [result, setResult] = useState<MatchResult | null>(null);

  const dayOptions = useMemo(() => {
    const total = daysInMonth(partnerDate.month, partnerDate.year);
    return Array.from({ length: total }, (_, i) => ({ label: `${i + 1}`, value: i + 1 }));
  }, [partnerDate.month, partnerDate.year]);

  const monthOptions = useMemo(
    () => MONTHS.map((label, i) => ({ label, value: i + 1 })),
    [],
  );

  const yearOptions = useMemo(
    () =>
      Array.from({ length: CURRENT_YEAR - FIRST_YEAR + 1 }, (_, i) => ({
        label: `${FIRST_YEAR + i}`,
        value: FIRST_YEAR + i,
      })),
    [],
  );

  const setPart = (patch: Partial<typeof partnerDate>) => {
    const next = { ...partnerDate, ...patch };
    setPartnerDate({ ...next, day: Math.min(next.day, daysInMonth(next.month, next.year)) });
  };

  const yourName = profile.name.trim() || 'You';
  const ready = !!profile.birthDate && partnerName.trim().length > 0;

  /**
   * Several kootas are asymmetric, so the method needs to know which chart is
   * read as the groom's. Gender decides it where onboarding has one.
   */
  const check = () => {
    if (!profile.birthDate) return;

    const you = { name: yourName, date: profile.birthDate };
    const partner = { name: partnerName.trim(), date: partnerDate };

    setResult(
      profile.gender === 'female' ? matchCharts(partner, you) : matchCharts(you, partner),
    );
  };

  if (result) {
    return (
      <Screen background={colors.white}>
        <NavHeader title="Match result" bordered onBack={() => setResult(null)} />

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.score}>
            <Text style={styles.scoreValue}>
              {result.total}
              <Text style={styles.scoreMax}> / {result.max}</Text>
            </Text>
            <Text style={styles.verdict}>{result.verdict}</Text>
            <Text style={styles.summary}>{result.summary}</Text>
          </View>

          <View style={styles.people}>
            {result.people.map((person) => (
              <View key={person.name} style={styles.person}>
                <Text style={styles.personName} numberOfLines={1}>
                  {person.name}
                </Text>
                <Text style={styles.personMeta}>{person.rashi.vedic} rashi</Text>
                <Text style={styles.personMeta}>{person.nakshatra}</Text>
              </View>
            ))}
          </View>

          <Text style={styles.sectionTitle}>The eight kootas</Text>

          <View style={styles.card}>
            {result.kootas.map((koota, index) => (
              <View key={koota.id} style={[styles.koota, index > 0 && styles.kootaDivider]}>
                <View style={styles.kootaHead}>
                  <Text style={styles.kootaLabel}>{koota.label}</Text>
                  <Text
                    style={[styles.kootaScore, koota.score === 0 && styles.kootaZero]}
                  >
                    {koota.score} / {koota.max}
                  </Text>
                </View>
                <Text style={styles.kootaAbout}>{koota.about}</Text>
              </View>
            ))}
          </View>

          <Text style={styles.note}>
            Guna Milan is one test among several, and it reads only the two moon
            positions. Mangal dosha, the seventh house and the timing of the wedding are
            not in this count.
          </Text>

          <View style={styles.actions}>
            <PrimaryButton
              label="Discuss this with an astrologer"
              onPress={() => router.push('/(tabs)/chat')}
            />
            <PrimaryButton
              label="Check another match"
              variant="outline"
              onPress={() => setResult(null)}
            />
          </View>
        </ScrollView>
      </Screen>
    );
  }

  return (
    <Screen background={colors.white}>
      <NavHeader title="Kundli matching" bordered />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.you}>
            <Text style={styles.youLabel}>Your details</Text>
            <Text style={styles.youValue}>{yourName}</Text>
            <Text style={styles.youMeta}>
              {profile.birthDate
                ? `${profile.birthDate.day} ${MONTHS[profile.birthDate.month - 1]} ${profile.birthDate.year}`
                : 'No birth date saved yet'}
            </Text>
          </View>

          {profile.birthDate ? null : (
            <PrimaryButton
              label="Add your birth details"
              onPress={() => router.push('/onboarding/name')}
              style={styles.addDetails}
            />
          )}

          <Text style={styles.sectionTitle}>Their details</Text>

          <TextInput
            value={partnerName}
            onChangeText={setPartnerName}
            placeholder="Their name"
            placeholderTextColor={colors.subtle}
            style={styles.input}
            autoCapitalize="words"
            autoCorrect={false}
            accessibilityLabel="Their name"
          />

          <Text style={styles.fieldLabel}>Their birth date</Text>

          <WheelPicker>
            <WheelColumn
              options={dayOptions}
              value={partnerDate.day}
              onChange={(day) => setPart({ day: day as number })}
            />
            <WheelColumn
              options={monthOptions}
              value={partnerDate.month}
              flex={1.6}
              onChange={(month) => setPart({ month: month as number })}
            />
            <WheelColumn
              options={yearOptions}
              value={partnerDate.year}
              flex={1.1}
              onChange={(year) => setPart({ year: year as number })}
            />
          </WheelPicker>

          <Text style={styles.note}>
            The count is read from both moon positions, so the birth dates are enough.
            Birth times would sharpen it, and an astrologer will ask for them.
          </Text>

          <PrimaryButton
            label="Check compatibility"
            disabled={!ready}
            onPress={check}
            style={styles.submit}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  content: {
    paddingHorizontal: GUTTER,
    paddingTop: space.lg,
    paddingBottom: space.xxl,
  },
  you: {
    padding: space.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.saffronSoft,
    borderWidth: 1,
    borderColor: colors.saffronBorder,
  },
  youLabel: {
    ...type.caption,
    color: colors.saffronDeep,
  },
  youValue: {
    ...type.section,
    color: colors.ink,
  },
  youMeta: {
    ...type.small,
    color: colors.muted,
  },
  addDetails: {
    marginTop: space.md,
  },
  sectionTitle: {
    ...type.section,
    color: colors.ink,
    marginTop: space.xl,
    marginBottom: space.md,
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
  fieldLabel: {
    ...type.caption,
    color: colors.muted,
    marginTop: space.lg,
    marginBottom: space.sm,
  },
  note: {
    ...type.small,
    color: colors.muted,
    marginTop: space.lg,
  },
  submit: {
    marginTop: space.xl,
  },

  score: {
    alignItems: 'center',
    paddingVertical: space.lg,
  },
  scoreValue: {
    fontFamily: font.bold,
    fontSize: 48,
    lineHeight: 58,
    color: colors.saffronDeep,
  },
  scoreMax: {
    fontFamily: font.regular,
    fontSize: 22,
    color: colors.muted,
  },
  verdict: {
    ...type.section,
    color: colors.ink,
  },
  summary: {
    ...type.body,
    color: colors.muted,
    textAlign: 'center',
    marginTop: space.sm,
  },
  people: {
    flexDirection: 'row',
    gap: space.md,
    marginTop: space.md,
  },
  person: {
    flex: 1,
    padding: space.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  personName: {
    ...type.label,
    color: colors.ink,
  },
  personMeta: {
    ...type.caption,
    color: colors.muted,
  },
  card: {
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  koota: {
    paddingHorizontal: space.lg,
    paddingVertical: space.md,
  },
  kootaDivider: {
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  kootaHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: space.md,
  },
  kootaLabel: {
    ...type.label,
    color: colors.ink,
  },
  kootaScore: {
    fontFamily: font.semibold,
    fontSize: 15,
    lineHeight: 21,
    color: colors.green,
    fontVariant: ['tabular-nums'],
  },
  kootaZero: {
    color: colors.red,
  },
  kootaAbout: {
    ...type.small,
    color: colors.muted,
  },
  actions: {
    marginTop: space.xl,
    gap: space.md,
  },
});
