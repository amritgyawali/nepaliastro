import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Card, NavHeader, ScoreBar, Screen, Segmented, Tag, Tappable } from '@/components';
import {
  ACTIVITIES, chartFor, findMuhurta, formatClock, formatGregorian, placeOf,
  type ActivityId, type DayScore,
} from '@/lib/jyotish';
import { useOnboarding } from '@/store/onboarding';
import { GUTTER, colors, space, type } from '@/theme';

/**
 * Shubha sait — choosing the day.
 *
 * Nobody asks "is today lucky"; they ask "when should we do this particular
 * thing". So the activity comes first, and every day is scored against that
 * activity's own requirements — a day that is excellent for opening a shop
 * can be poor for a wedding. Each day shows the reasons it scored what it
 * did, so the answer can be argued with rather than just accepted.
 */
export default function MuhurtaScreen() {
  const { profile } = useOnboarding();
  const [activityId, setActivityId] = useState<ActivityId>('marriage');
  const [expanded, setExpanded] = useState<string | null>(null);

  const chart = useMemo(() => chartFor(profile), [profile]);
  const place = useMemo(() => placeOf(profile), [profile]);
  const activity = ACTIVITIES.find((a) => a.id === activityId)!;

  const days = useMemo(
    () => findMuhurta(activity, { days: 60, chart, place }),
    [activity, chart, place],
  );

  // The shortlist is what people came for; the rest of the run is below it so
  // a rejected day can be checked rather than silently dropped.
  const best = useMemo(
    () => [...days].sort((a, b) => b.score - a.score).filter((d) => d.score >= 62).slice(0, 8),
    [days],
  );

  const renderDay = (day: DayScore, key: string) => {
    const isOpen = expanded === key;

    return (
      <Tappable
        feel="card"
        key={key}
        accessibilityRole="button"
        accessibilityState={{ expanded: isOpen }}
        accessibilityLabel={`${formatGregorian(day.date)}, ${day.verdict}, score ${day.score}`}
        onPress={() => setExpanded(isOpen ? null : key)}
        style={styles.dayRow}
        pressedStyle={styles.pressed}
      >
        <View style={styles.dayHead}>
          <View style={styles.dayText}>
            <Text style={styles.dayDate}>{formatGregorian(day.date)}</Text>
            <Text style={styles.dayDetail}>
              {day.panchang.weekday.en} · {day.panchang.nakshatra.meta.name} ·{' '}
              {day.panchang.tithi.paksha} {day.panchang.tithi.name}
            </Text>
          </View>
          <Tag
            label={day.verdict}
            tone={day.score >= 78 ? 'good' : day.score >= 62 ? 'accent' : day.score >= 45 ? 'neutral' : 'bad'}
          />
        </View>

        {day.bestWindow ? (
          <Text style={styles.window}>
            Best window {formatClock(day.bestWindow.from)} – {formatClock(day.bestWindow.to)}
            {day.bestWindow.name ? ` · ${day.bestWindow.name}` : ''}
          </Text>
        ) : null}

        <View style={styles.bar}>
          <ScoreBar value={day.score} caption={`${day.score} / 100`} />
        </View>

        {isOpen ? (
          <View style={styles.reasons}>
            {day.reasons.map((reason, i) => (
              <Text key={i} style={styles.reason}>
                <Text style={reason.weight >= 0 ? styles.plus : styles.minus}>
                  {reason.weight >= 0 ? '+' : ''}{reason.weight}
                </Text>{' '}
                {reason.text}
              </Text>
            ))}
          </View>
        ) : null}
      </Tappable>
    );
  };

  return (
    <Screen>
      <NavHeader title="Shubha Sait" bordered />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.intro}>What are you choosing a day for?</Text>

        <Segmented
          scrollable
          value={activityId}
          onChange={setActivityId}
          options={ACTIVITIES.map((a) => ({ value: a.id, label: a.name }))}
        />

        <Card style={styles.card}>
          <Text style={styles.activityName}>
            {activity.name} <Text style={styles.activityNp}>{activity.np}</Text>
          </Text>
          <Text style={styles.activityAbout}>{activity.about}</Text>
          {!chart ? (
            <Text style={styles.noChart}>
              Add your birth date and these days will also be weighed against your own
              birth star — tarabala and chandrabala, which is what makes a sait personal.
            </Text>
          ) : (
            <Text style={styles.withChart}>
              Weighed against your birth star, {chart.nakshatra.name}, and your rashi,{' '}
              {chart.rashi.vedic}.
            </Text>
          )}
        </Card>

        <Text style={styles.sectionTitle}>
          {best.length ? `${best.length} good days in the next two months` : 'Nothing clearly good in the next two months'}
        </Text>
        {best.length === 0 ? (
          <Text style={styles.sectionNote}>
            That happens — the nakshatras this work wants may simply not fall well in
            this stretch. Every day of the run is listed below with its score.
          </Text>
        ) : (
          <Text style={styles.sectionNote}>Tap a day to see why it scored what it did.</Text>
        )}

        <Card padded={false} style={styles.card}>
          {best.map((day, i) => renderDay(day, `best-${i}`))}
        </Card>

        <Text style={styles.sectionTitle}>Every day in the run</Text>
        <Card padded={false} style={styles.card}>
          {days.map((day, i) => renderDay(day, `all-${i}`))}
        </Card>

        <Text style={styles.footnote}>
          Scored on the five limbs of the panchang for that day, the nakshatras the
          classics name for this work, and — where a birth date is known — tarabala and
          chandrabala from your own star. A marriage also needs its lagna checked, which
          is on the Shubha Lagna screen.
        </Text>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: space.lg, paddingBottom: space.xxl },
  intro: { ...type.small, color: colors.muted, paddingHorizontal: GUTTER, marginBottom: space.sm },
  card: { marginHorizontal: GUTTER, marginTop: space.md },
  activityName: { ...type.section, color: colors.ink },
  activityNp: { ...type.small, color: colors.saffronDeep },
  activityAbout: { ...type.small, color: colors.muted, marginTop: 2 },
  noChart: { ...type.small, color: colors.body, marginTop: space.sm },
  withChart: { ...type.small, color: colors.green, marginTop: space.sm },
  sectionTitle: { ...type.section, color: colors.ink, paddingHorizontal: GUTTER, marginTop: space.xl },
  sectionNote: { ...type.small, color: colors.muted, paddingHorizontal: GUTTER },
  dayRow: {
    paddingHorizontal: space.lg, paddingVertical: space.md,
    borderTopWidth: 1, borderTopColor: colors.divider,
  },
  pressed: { backgroundColor: colors.fill },
  dayHead: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: space.md },
  dayText: { flexShrink: 1 },
  dayDate: { ...type.label, color: colors.ink },
  dayDetail: { ...type.small, color: colors.muted },
  window: { ...type.small, color: colors.saffronDeep, marginTop: 2 },
  bar: { marginTop: space.sm },
  reasons: { marginTop: space.md, gap: space.xs },
  reason: { ...type.small, color: colors.body },
  plus: { color: colors.green },
  minus: { color: colors.red },
  footnote: { ...type.small, color: colors.subtle, paddingHorizontal: GUTTER, marginTop: space.xl },
});
