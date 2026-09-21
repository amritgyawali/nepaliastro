import React, { useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';

import {
  BirthDetailsForm, Card, NavHeader, NeedsBirth, PrimaryButton, Screen, ScoreBar,
  Tag, emptyBirthDetails, type BirthDetails,
} from '@/components';
import {
  buildChart, chartFor, matchCharts, type MatchResult,
} from '@/lib/jyotish';
import { useOnboarding } from '@/store/onboarding';
import { GUTTER, colors, space, type } from '@/theme';

/** A form's answers as a chart. */
function chartFromDetails(details: BirthDetails) {
  const { date, time, timeKnown, place } = details;
  const hour = timeKnown ? time.hour : 12;
  const minute = timeKnown ? time.minute : 0;

  return buildChart({
    at: new Date(
      Date.UTC(date.year, date.month - 1, date.day, hour, minute) -
        place.utcOffsetMinutes * 60_000,
    ),
    place,
    timeKnown,
  });
}

/**
 * Kundali milan — the eight koots, out of thirty-six.
 *
 * The number people know is eighteen, so the result leads with the total and
 * says where it stands against that line. Every koot is then shown with its
 * own score and the reason for it, because "19 out of 36" tells a family
 * nothing about whether the thing pulling it down is serious or cancelled.
 */
export default function MatchingScreen() {
  const { profile } = useOnboarding();
  const [partner, setPartner] = useState<BirthDetails>(emptyBirthDetails);
  const [result, setResult] = useState<MatchResult | null>(null);

  const yours = useMemo(() => chartFor(profile), [profile]);
  const yourName = profile.name.trim() || 'You';
  const ready = !!yours && partner.name.trim().length > 0;

  if (!yours) {
    return (
      <Screen>
        <NavHeader title="Kundali Milan" bordered />
        <NeedsBirth what="Matching compares your moon sign and birth star against theirs, so your own birth date is needed first." />
      </Screen>
    );
  }

  const run = () => {
    const theirs = chartFromDetails(partner);
    // The koot tables are written groom-first, so the male chart goes first
    // whichever side of the match the account holder is on.
    const isGroom = profile.gender !== 'female';
    setResult(isGroom ? matchCharts(yours, theirs) : matchCharts(theirs, yours));
  };

  return (
    <Screen>
      <NavHeader title="Kundali Milan" bordered />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {result ? (
            <>
              <Card accent style={styles.card}>
                <Text style={styles.totalLabel}>
                  {yourName} and {partner.name.trim()}
                </Text>
                <Text style={styles.total}>
                  {result.total}
                  <Text style={styles.totalMax}> / 36</Text>
                </Text>
                <Tag
                  label={result.verdict}
                  tone={result.total >= 26 ? 'good' : result.total >= 18 ? 'accent' : 'bad'}
                />
                <Text style={styles.summary}>{result.summary}</Text>
              </Card>

              <Card title="Mangal dosha" style={styles.card}>
                <Text style={styles.body}>{result.mangal.note}</Text>
              </Card>

              <Text style={styles.sectionTitle}>The eight koots</Text>
              <Card style={styles.card}>
                {result.koots.map((koot, index) => (
                  <View key={koot.id} style={index > 0 ? styles.kootSpaced : undefined}>
                    <ScoreBar
                      value={(koot.score / koot.max) * 100}
                      label={`${koot.name} · ${koot.np}`}
                      caption={`${koot.score} / ${koot.max}`}
                    />
                    <Text style={styles.kootAbout}>{koot.about}</Text>
                    <Text style={styles.kootFinding}>{koot.finding}</Text>
                    {koot.cancellation ? (
                      <Text style={styles.cancellation}>Cancelled — {koot.cancellation}</Text>
                    ) : null}
                  </View>
                ))}
              </Card>

              {result.concerns.length ? (
                <Card style={styles.card}>
                  <Text style={styles.concernTitle}>What to look at</Text>
                  {result.concerns.map((koot) => (
                    <Text key={koot.id} style={styles.bullet}>
                      • {koot.name} scored nothing. {koot.finding}
                    </Text>
                  ))}
                  <Text style={styles.concernNote}>
                    An afflicted koot is a reason to sit with an astrologer over the two
                    charts, not a reason to call the match off. Most have recognised
                    exemptions, and a chart is read whole.
                  </Text>
                </Card>
              ) : null}

              <PrimaryButton
                label="Match someone else"
                variant="outline"
                onPress={() => setResult(null)}
                style={styles.cta}
              />
            </>
          ) : (
            <>
              <Card style={styles.card}>
                <Text style={styles.yoursTitle}>Your side</Text>
                <Text style={styles.yoursBody}>
                  {yourName} — {yours.rashi.vedic} moon, {yours.nakshatra.name} nakshatra,{' '}
                  {yours.nakshatra.gana} gana, {yours.nakshatra.nadi} nadi.
                </Text>
              </Card>

              <Card style={styles.card}>
                <BirthDetailsForm
                  title="Their details"
                  value={partner}
                  onChange={setPartner}
                />
              </Card>

              <PrimaryButton
                label="Match the charts"
                onPress={run}
                disabled={!ready}
                style={styles.cta}
              />
              <Text style={styles.footnote}>
                The eight koots weigh temperament, affinity, health and the household —
                nadi alone is worth eight of the thirty-six. Everything is computed from
                the two moon positions; nothing is sent anywhere.
              </Text>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { paddingTop: space.lg, paddingBottom: space.xxl },
  card: { marginHorizontal: GUTTER, marginTop: space.md },
  totalLabel: { ...type.label, color: colors.saffronDeep },
  total: { ...type.display, fontSize: 44, lineHeight: 52, color: colors.ink },
  totalMax: { ...type.title, color: colors.muted },
  summary: { ...type.body, color: colors.body, marginTop: space.sm },
  body: { ...type.body, color: colors.body },
  sectionTitle: { ...type.section, color: colors.ink, paddingHorizontal: GUTTER, marginTop: space.xl },
  kootSpaced: { marginTop: space.lg, borderTopWidth: 1, borderTopColor: colors.divider, paddingTop: space.lg },
  kootAbout: { ...type.small, color: colors.muted, marginTop: space.xs },
  kootFinding: { ...type.small, color: colors.body, marginTop: 2 },
  cancellation: { ...type.small, color: colors.green, marginTop: 2 },
  concernTitle: { ...type.section, color: colors.ink, marginBottom: space.sm },
  bullet: { ...type.small, color: colors.body, marginBottom: space.xs },
  concernNote: { ...type.small, color: colors.muted, marginTop: space.sm },
  yoursTitle: { ...type.section, color: colors.ink },
  yoursBody: { ...type.body, color: colors.muted, marginTop: space.xs },
  cta: { marginHorizontal: GUTTER, marginTop: space.xl },
  footnote: { ...type.small, color: colors.subtle, paddingHorizontal: GUTTER, marginTop: space.lg },
});
