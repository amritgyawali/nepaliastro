import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Card, NavHeader, NeedsBirth, Screen, ScoreBar, Tag } from '@/components';
import {
  chartFor, formatGregorian, gocharSummary, nextSignChange, transitsFor,
} from '@/lib/jyotish';
import { useOnboarding } from '@/store/onboarding';
import { GUTTER, colors, space, type } from '@/theme';

/**
 * Gochar — where the grahas are now, counted from your moon.
 *
 * Saturn in Meena is a fact; Saturn in the twelfth from your moon is a
 * reading. The slow grahas come first because they are the ones that set the
 * shape of a period of life — the moon changes sign every two and a half
 * days and decides an afternoon.
 */
export default function TransitScreen() {
  const { profile } = useOnboarding();
  const now = useMemo(() => new Date(), []);
  const chart = useMemo(() => chartFor(profile), [profile]);

  const transits = useMemo(() => (chart ? transitsFor(chart, now) : []), [chart, now]);
  const summary = useMemo(() => (transits.length ? gocharSummary(transits) : null), [transits]);

  if (!chart || !summary) {
    return (
      <Screen>
        <NavHeader title="Gochar" bordered />
        <NeedsBirth what="A transit means something only in relation to your own moon sign, so your birth date is needed." />
      </Screen>
    );
  }

  return (
    <Screen>
      <NavHeader title="Gochar" bordered />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Card accent style={styles.card}>
          <Text style={styles.label}>Counted from {chart.rashi.vedic}, your moon sign</Text>
          <Text style={styles.headline}>
            {summary.balance > 20
              ? 'The weather is with you'
              : summary.balance < -20
                ? 'A stretch that asks for patience'
                : 'Mixed — some doors open, some do not'}
          </Text>
          <View style={styles.bar}>
            <ScoreBar
              value={(summary.balance + 100) / 2}
              caption={`${summary.favourable.length} of 9 well placed`}
            />
          </View>
          <Text style={styles.note}>
            Weighted towards the slow grahas: Saturn holds a sign for two and a half
            years, the moon for two and a half days.
          </Text>
        </Card>

        <Text style={styles.sectionTitle}>The slow ones</Text>
        <Text style={styles.sectionNote}>These set the tone of the whole period.</Text>
        <Card padded={false} style={styles.card}>
          {summary.slowMovers.map((t, i) => {
            const change = nextSignChange(t.graha, now);
            return (
              <View key={t.graha} style={[styles.row, i > 0 && styles.divided]}>
                <View style={styles.rowHead}>
                  <Text style={styles.grahaName}>
                    {t.name} <Text style={styles.grahaNp}>{t.np}</Text>
                  </Text>
                  <Tag label={t.favourable ? 'Favourable' : 'Testing'} tone={t.favourable ? 'good' : 'bad'} />
                </View>
                <Text style={styles.position}>
                  In {t.rashi} — your {t.house}th house
                  {t.retrograde ? ', retrograde' : ''}
                </Text>
                <Text style={styles.rowNote}>{t.note}</Text>
                {change ? (
                  <Text style={styles.change}>Moves on {formatGregorian(change)}</Text>
                ) : null}
              </View>
            );
          })}
        </Card>

        <Text style={styles.sectionTitle}>All nine</Text>
        <Card padded={false} style={styles.card}>
          {transits.map((t, i) => (
            <View key={t.graha} style={[styles.row, i > 0 && styles.divided]}>
              <View style={styles.rowHead}>
                <Text style={styles.grahaName}>{t.name}</Text>
                <Text style={styles.house}>
                  {t.rashi} · {t.house}th
                </Text>
              </View>
              <Text style={styles.rowNote}>{t.note}</Text>
            </View>
          ))}
        </Card>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: space.lg, paddingBottom: space.xxl },
  card: { marginHorizontal: GUTTER, marginTop: space.md },
  label: { ...type.caption, color: colors.saffronDeep, textTransform: 'uppercase', letterSpacing: 0.6 },
  headline: { ...type.title, color: colors.ink, marginTop: 2 },
  bar: { marginTop: space.md },
  note: { ...type.small, color: colors.muted, marginTop: space.sm },
  sectionTitle: { ...type.section, color: colors.ink, paddingHorizontal: GUTTER, marginTop: space.xl },
  sectionNote: { ...type.small, color: colors.muted, paddingHorizontal: GUTTER },
  row: { paddingHorizontal: space.lg, paddingVertical: space.md },
  divided: { borderTopWidth: 1, borderTopColor: colors.divider },
  rowHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: space.md },
  grahaName: { ...type.label, color: colors.ink },
  grahaNp: { ...type.caption, color: colors.subtle },
  house: { ...type.small, color: colors.muted },
  position: { ...type.small, color: colors.saffronDeep, marginTop: 2 },
  rowNote: { ...type.small, color: colors.muted, marginTop: 2 },
  change: { ...type.caption, color: colors.body, marginTop: space.xs },
});
