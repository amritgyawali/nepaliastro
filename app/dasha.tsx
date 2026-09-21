import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Card, NavHeader, NeedsBirth, Screen, ScoreBar, Tag } from '@/components';
import {
  chartFor, dashaAt, dashaVerdict, formatGregorian, vimshottariDasha,
  type DashaPeriod,
} from '@/lib/jyotish';
import { useOnboarding } from '@/store/onboarding';
import { GUTTER, colors, radius, space, type } from '@/theme';

/** How far through a period we are now, 0–100. */
function progressOf(period: DashaPeriod, now: Date): number {
  const span = period.to.getTime() - period.from.getTime();
  if (span <= 0) return 0;
  return ((now.getTime() - period.from.getTime()) / span) * 100;
}

/**
 * Graha dasha — the reading people actually come for.
 *
 * The chart says what can happen; the dasha says when. The period running
 * right now is at the top with the time left in it, because that is the one
 * question being asked, and the full hundred and twenty years are underneath
 * for anyone who wants to look ahead.
 */
export default function DashaScreen() {
  const { profile } = useOnboarding();
  const now = useMemo(() => new Date(), []);
  const chart = useMemo(() => chartFor(profile), [profile]);
  const [open, setOpen] = useState<string | null>(null);

  const tree = useMemo(() => (chart ? vimshottariDasha(chart, 3) : null), [chart]);
  const running = useMemo(() => (tree ? dashaAt(tree, now) : null), [tree, now]);

  if (!chart || !tree) {
    return (
      <Screen>
        <NavHeader title="Graha Dasha" bordered />
        <NeedsBirth what="Your dasha sequence is set by how far the moon had travelled into its nakshatra at the moment you were born." />
      </Screen>
    );
  }

  const verdict = running ? dashaVerdict(chart, running.maha.lord) : null;

  return (
    <Screen>
      <NavHeader title="Graha Dasha" bordered />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {running ? (
          <Card accent style={styles.card}>
            <Text style={styles.runningLabel}>Running now</Text>
            <Text style={styles.runningTitle}>
              {running.maha.lordName}
              {running.antar ? ` – ${running.antar.lordName}` : ''}
              {running.pratyantar ? ` – ${running.pratyantar.lordName}` : ''}
            </Text>
            <Text style={styles.runningDates}>
              Mahadasha to {formatGregorian(running.maha.to)}
              {running.antar ? ` · antardasha to ${formatGregorian(running.antar.to)}` : ''}
            </Text>

            <View style={styles.bars}>
              <ScoreBar
                neutral
                value={progressOf(running.maha, now)}
                label={`${running.maha.lordName} mahadasha`}
                caption={`${running.maha.years.toFixed(1)} years`}
              />
              {running.antar ? (
                <ScoreBar
                  neutral
                  value={progressOf(running.antar, now)}
                  label={`${running.antar.lordName} antardasha`}
                  caption={`${(running.antar.years * 12).toFixed(0)} months`}
                />
              ) : null}
            </View>

            {verdict ? (
              <View style={styles.verdict}>
                <Tag
                  label={verdict.tone === 'strong' ? 'Favourable' : verdict.tone === 'testing' ? 'Testing' : 'Mixed'}
                  tone={verdict.tone === 'strong' ? 'good' : verdict.tone === 'testing' ? 'bad' : 'neutral'}
                />
                <Text style={styles.verdictText}>{verdict.summary}</Text>
              </View>
            ) : null}
          </Card>
        ) : null}

        <Card style={styles.card}>
          <Text style={styles.balanceTitle}>Where your sequence starts</Text>
          <Text style={styles.balanceBody}>
            You were born in {chart.nakshatra.name}, whose lord is {tree.startLord}. The moon
            had already crossed part of it, so your first mahadasha began with{' '}
            {tree.balanceYears.toFixed(2)} of its years left rather than the full term.
            Everything after that follows the fixed order.
          </Text>
        </Card>

        <Text style={styles.sectionTitle}>All nine mahadashas</Text>
        <Text style={styles.sectionNote}>Tap one to see its antardashas.</Text>

        <Card padded={false} style={styles.card}>
          {tree.periods.map((maha, index) => {
            const isOpen = open === `${maha.lord}-${index}`;
            const isRunning = running?.maha === maha;
            const isPast = maha.to < now;

            return (
              <View key={`${maha.lord}-${index}`}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{ expanded: isOpen }}
                  accessibilityLabel={`${maha.lordName} mahadasha, ${formatGregorian(maha.from)} to ${formatGregorian(maha.to)}`}
                  onPress={() => setOpen(isOpen ? null : `${maha.lord}-${index}`)}
                  style={({ pressed }) => [
                    styles.mahaRow,
                    index > 0 && styles.divider,
                    isRunning && styles.mahaRunning,
                    pressed && styles.pressed,
                  ]}
                >
                  <View style={styles.mahaText}>
                    <Text style={[styles.mahaName, isPast && styles.past]}>
                      {maha.lordName} <Text style={styles.mahaNp}>{maha.lordNp}</Text>
                    </Text>
                    <Text style={styles.mahaDates}>
                      {formatGregorian(maha.from)} → {formatGregorian(maha.to)}
                    </Text>
                  </View>
                  <Text style={[styles.mahaYears, isPast && styles.past]}>
                    {maha.years.toFixed(1)}y
                  </Text>
                </Pressable>

                {isOpen
                  ? maha.children.map((antar) => {
                      const antarRunning = running?.antar === antar;
                      return (
                        <View
                          key={`${antar.lord}-${antar.from.getTime()}`}
                          style={[styles.antarRow, antarRunning && styles.antarRunning]}
                        >
                          <Text style={styles.antarName}>
                            {maha.lordName} – {antar.lordName}
                          </Text>
                          <Text style={styles.antarDates}>
                            {formatGregorian(antar.from)} → {formatGregorian(antar.to)}
                          </Text>
                        </View>
                      );
                    })
                  : null}
              </View>
            );
          })}
        </Card>

        <Text style={styles.footnote}>
          Vimshottari runs a hundred and twenty years across nine lords. A dasha is not
          good or bad in itself — it gives whatever its lord is able to give in your
          chart, which is why the note above reads {running?.maha.lordName ?? 'the lord'}’s
          own placement rather than quoting a fixed meaning.
        </Text>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: space.lg, paddingBottom: space.xxl },
  card: { marginHorizontal: GUTTER, marginTop: space.md },
  runningLabel: { ...type.caption, color: colors.saffronDeep, textTransform: 'uppercase', letterSpacing: 0.6 },
  runningTitle: { ...type.display, color: colors.ink, marginTop: 2 },
  runningDates: { ...type.small, color: colors.body },
  bars: { gap: space.md, marginTop: space.lg },
  verdict: { marginTop: space.lg, gap: space.sm },
  verdictText: { ...type.body, color: colors.body },
  balanceTitle: { ...type.section, color: colors.ink },
  balanceBody: { ...type.body, color: colors.muted, marginTop: space.xs },
  sectionTitle: { ...type.section, color: colors.ink, paddingHorizontal: GUTTER, marginTop: space.xl },
  sectionNote: { ...type.small, color: colors.muted, paddingHorizontal: GUTTER },
  mahaRow: {
    flexDirection: 'row', alignItems: 'center', gap: space.md,
    paddingHorizontal: space.lg, paddingVertical: space.md,
  },
  mahaRunning: { backgroundColor: colors.saffronSoft },
  divider: { borderTopWidth: 1, borderTopColor: colors.divider },
  pressed: { opacity: 0.65 },
  mahaText: { flex: 1 },
  mahaName: { ...type.label, color: colors.ink },
  mahaNp: { ...type.caption, color: colors.subtle },
  mahaDates: { ...type.small, color: colors.muted },
  mahaYears: { ...type.label, color: colors.muted },
  past: { color: colors.subtle },
  antarRow: {
    paddingHorizontal: space.lg, paddingLeft: space.xxl, paddingVertical: space.sm,
    borderTopWidth: 1, borderTopColor: colors.divider, backgroundColor: colors.canvas,
  },
  antarRunning: { backgroundColor: colors.saffronSoft, borderRadius: radius.sm },
  antarName: { ...type.small, color: colors.ink },
  antarDates: { ...type.caption, color: colors.muted },
  footnote: { ...type.small, color: colors.subtle, paddingHorizontal: GUTTER, marginTop: space.xl },
});
