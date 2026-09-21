import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Card, NavHeader, NeedsBirth, Screen, Tag } from '@/components';
import { allDoshas, chartFor, formatGregorian, sadeSati, type Dosha, type Severity } from '@/lib/jyotish';
import { useOnboarding } from '@/store/onboarding';
import { GUTTER, colors, space, type } from '@/theme';

function toneFor(severity: Severity): 'good' | 'bad' | 'neutral' | 'accent' {
  if (severity === 'none') return 'good';
  if (severity === 'cancelled') return 'accent';
  if (severity === 'severe' || severity === 'moderate') return 'bad';
  return 'neutral';
}

function labelFor(dosha: Dosha): string {
  if (!dosha.present) return 'Not present';
  if (dosha.severity === 'cancelled') return 'Present but cancelled';
  return `${dosha.severity[0].toUpperCase()}${dosha.severity.slice(1)}`;
}

/**
 * The dosha check.
 *
 * People arrive here having been told they have something, usually without
 * being told why or what cancels it. So every dosha is reported either way —
 * a clean result is stated as clearly as an affliction — and where a
 * classical rule cancels one, the cancellation is shown as prominently as
 * the finding. A dosha that is cancelled is not a dosha.
 */
export default function DoshaScreen() {
  const { profile } = useOnboarding();
  const now = useMemo(() => new Date(), []);
  const chart = useMemo(() => chartFor(profile), [profile]);

  const doshas = useMemo(() => (chart ? allDoshas(chart) : []), [chart]);
  const saturn = useMemo(() => (chart ? sadeSati(chart, now) : null), [chart, now]);

  if (!chart) {
    return (
      <Screen>
        <NavHeader title="Dosha check" bordered />
        <NeedsBirth what="Doshas are read from where Mars, Rahu, Ketu and Saturn fall in your chart." />
      </Screen>
    );
  }

  const active = doshas.filter((d) => d.present && d.severity !== 'cancelled');

  return (
    <Screen>
      <NavHeader title="Dosha check" bordered />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Card accent style={styles.card}>
          <Text style={styles.summaryTitle}>
            {active.length === 0
              ? 'Nothing active in your chart'
              : `${active.length} to be aware of`}
          </Text>
          <Text style={styles.summaryBody}>
            {active.length === 0
              ? 'None of the five doshas this app checks is active for you. Where one was technically present, a classical rule cancels it — the detail is below.'
              : `${active.map((d) => d.name).join(', ')}. Each one below says exactly what was found and what the classics offer against it.`}
          </Text>
        </Card>

        {doshas.map((dosha) => (
          <Card key={dosha.id} style={styles.card}>
            <View style={styles.head}>
              <View style={styles.headText}>
                <Text style={styles.name}>{dosha.name}</Text>
                <Text style={styles.np}>{dosha.np}</Text>
              </View>
              <Tag label={labelFor(dosha)} tone={toneFor(dosha.severity)} />
            </View>

            <Text style={styles.finding}>{dosha.finding}</Text>

            {dosha.cancellations.length ? (
              <View style={styles.block}>
                <Text style={styles.blockTitle}>What cancels it</Text>
                {dosha.cancellations.map((line) => (
                  <Text key={line} style={styles.bullet}>• {line}</Text>
                ))}
              </View>
            ) : null}

            {dosha.effects.length ? (
              <View style={styles.block}>
                <Text style={styles.blockTitle}>What it is said to bring</Text>
                {dosha.effects.map((line) => (
                  <Text key={line} style={styles.bullet}>• {line}</Text>
                ))}
              </View>
            ) : null}

            {dosha.remedies.length ? (
              <View style={styles.block}>
                <Text style={styles.blockTitle}>Remedies</Text>
                {dosha.remedies.map((line) => (
                  <Text key={line} style={styles.bullet}>• {line}</Text>
                ))}
              </View>
            ) : null}
          </Card>
        ))}

        {saturn ? (
          <Card style={styles.card}>
            <View style={styles.head}>
              <View style={styles.headText}>
                <Text style={styles.name}>Sade Sati</Text>
                <Text style={styles.np}>साढेसाती</Text>
              </View>
              <Tag
                label={saturn.active ? 'Running now' : saturn.dhaiya ? 'Dhaiya running' : 'Not running'}
                tone={saturn.active ? 'bad' : saturn.dhaiya ? 'neutral' : 'good'}
              />
            </View>

            <Text style={styles.finding}>
              {saturn.active && saturn.currentPhase
                ? `You are in the ${saturn.currentPhase.phase.toLowerCase()} phase, with Saturn in ${saturn.currentPhase.sign} until ${formatGregorian(saturn.currentPhase.to)}.`
                : saturn.dhaiya
                  ? 'Saturn is in the fourth or eighth from your moon — the lesser two-and-a-half years, not the full sade sati.'
                  : `Saturn is clear of your moon sign and its neighbours. Your next sade sati is shown below.`}
            </Text>

            <View style={styles.block}>
              <Text style={styles.blockTitle}>
                {saturn.active ? 'This cycle' : 'The next cycle'}
              </Text>
              {saturn.phases.map((phase) => (
                <View key={phase.phase} style={styles.phaseRow}>
                  <Text style={styles.phaseName}>{phase.phase} · {phase.sign}</Text>
                  <Text style={styles.phaseDates}>
                    {formatGregorian(phase.from)} → {formatGregorian(phase.to)}
                  </Text>
                  <Text style={styles.phaseAbout}>{phase.about}</Text>
                </View>
              ))}
            </View>
          </Card>
        ) : null}

        <Text style={styles.footnote}>
          A dosha describes a difficulty, not a sentence. Every one of these has been
          carried by people who lived perfectly good lives, and the classical texts
          spend as much space on what cancels them as on what causes them.
        </Text>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: space.lg, paddingBottom: space.xxl },
  card: { marginHorizontal: GUTTER, marginTop: space.md },
  summaryTitle: { ...type.title, color: colors.ink },
  summaryBody: { ...type.body, color: colors.body, marginTop: space.xs },
  head: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: space.md },
  headText: { flexShrink: 1 },
  name: { ...type.section, color: colors.ink },
  np: { ...type.small, color: colors.muted },
  finding: { ...type.body, color: colors.body, marginTop: space.sm },
  block: { marginTop: space.lg, gap: space.xs },
  blockTitle: { ...type.caption, color: colors.muted, textTransform: 'uppercase', letterSpacing: 0.6 },
  bullet: { ...type.small, color: colors.body },
  phaseRow: { marginTop: space.sm },
  phaseName: { ...type.label, color: colors.ink },
  phaseDates: { ...type.caption, color: colors.saffronDeep },
  phaseAbout: { ...type.small, color: colors.muted },
  footnote: { ...type.small, color: colors.subtle, paddingHorizontal: GUTTER, marginTop: space.xl },
});
