import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Card, NavHeader, Screen, Segmented, Tag } from '@/components';
import {
  ACTIVITIES, addDays, formatClock, formatDuration, formatGregorian, lagnaWindows,
  placeOf, startOfNepaliDay, type ActivityId,
} from '@/lib/jyotish';
import { useOnboarding } from '@/store/onboarding';
import { GUTTER, colors, space, type } from '@/theme';

/** Only the activities that actually specify a lagna are worth offering here. */
const WITH_LAGNA = ACTIVITIES.filter((a) => a.lagnas.length > 0);

/**
 * Shubha lagna — which sign is rising, and when.
 *
 * A ceremony is fixed to a lagna, not to a clock time: the sait is "in
 * Vrishabha lagna", and the family gathers for whenever that is. Signs rise
 * unevenly — at Kathmandu's latitude one can hold the horizon for well over
 * two hours and another for barely an hour — so this is computed rather than
 * divided into twelve equal slots.
 */
export default function LagnaScreen() {
  const { profile } = useOnboarding();
  const place = useMemo(() => placeOf(profile), [profile]);

  const [dayOffset, setDayOffset] = useState(0);
  const [activityId, setActivityId] = useState<ActivityId>('marriage');

  const activity = WITH_LAGNA.find((a) => a.id === activityId);
  const date = useMemo(
    () => addDays(startOfNepaliDay(new Date()), dayOffset),
    [dayOffset],
  );
  const windows = useMemo(
    () => lagnaWindows(date, place, activity),
    [date, place, activity],
  );

  const now = new Date();

  return (
    <Screen>
      <NavHeader title="Shubha Lagna" bordered />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.head}>
          <Text style={styles.date}>{formatGregorian(date)}</Text>
          <Text style={styles.place}>{place.name}</Text>
        </View>

        <Segmented
          scrollable
          value={`${dayOffset}`}
          onChange={(v) => setDayOffset(Number(v))}
          options={Array.from({ length: 10 }, (_, i) => ({
            value: `${i}`,
            label: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : formatGregorian(addDays(startOfNepaliDay(new Date()), i)).split(' ').slice(0, 2).join(' '),
          }))}
        />

        <Text style={styles.forLabel}>Checking against</Text>
        <Segmented
          scrollable
          value={activityId}
          onChange={setActivityId}
          options={WITH_LAGNA.map((a) => ({ value: a.id, label: a.name }))}
        />

        {activity ? (
          <Card style={styles.card}>
            <Text style={styles.activityAbout}>
              For {activity.name.toLowerCase()}, the classics favour{' '}
              {activity.id === 'marriage'
                ? 'fixed and dual signs — a movable lagna is held to make a union restless'
                : 'the lagnas marked below'}
              . Those are marked suitable.
            </Text>
          </Card>
        ) : null}

        <Card padded={false} style={styles.card}>
          {windows.map((window, index) => {
            const minutes = (window.to.getTime() - window.from.getTime()) / 60_000;
            const isNow = now >= window.from && now < window.to;

            return (
              <View
                key={`${window.rashi}-${index}`}
                style={[styles.row, index > 0 && styles.divided, isNow && styles.rowNow]}
              >
                <View style={styles.rowText}>
                  <Text style={styles.rashi}>
                    {window.rashi} <Text style={styles.np}>{window.np}</Text>
                  </Text>
                  <Text style={styles.time}>
                    {formatClock(window.from)} – {formatClock(window.to)} ·{' '}
                    {formatDuration(minutes)}
                  </Text>
                </View>

                <View style={styles.tags}>
                  {isNow ? <Tag label="Now" tone="accent" /> : null}
                  {window.suitable ? <Tag label="Suitable" tone="good" /> : null}
                </View>
              </View>
            );
          })}
        </Card>

        <Text style={styles.footnote}>
          The lengths differ because signs rise unevenly: at this latitude the short
          ascension signs cross the horizon in about an hour and a half, the long ones
          take well over two. The twelve always add to a full day.
        </Text>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: space.lg, paddingBottom: space.xxl },
  head: { paddingHorizontal: GUTTER, marginBottom: space.md },
  date: { ...type.display, color: colors.ink },
  place: { ...type.small, color: colors.muted },
  forLabel: { ...type.caption, color: colors.muted, paddingHorizontal: GUTTER, marginTop: space.lg, marginBottom: space.sm },
  card: { marginHorizontal: GUTTER, marginTop: space.md },
  activityAbout: { ...type.small, color: colors.muted },
  row: {
    flexDirection: 'row', alignItems: 'center', gap: space.md,
    paddingHorizontal: space.lg, paddingVertical: space.md,
  },
  divided: { borderTopWidth: 1, borderTopColor: colors.divider },
  rowNow: { backgroundColor: colors.saffronSoft },
  rowText: { flex: 1 },
  rashi: { ...type.label, color: colors.ink },
  np: { ...type.caption, color: colors.subtle },
  time: { ...type.small, color: colors.muted },
  tags: { gap: space.xs, alignItems: 'flex-end' },
  footnote: { ...type.small, color: colors.subtle, paddingHorizontal: GUTTER, marginTop: space.xl },
});
