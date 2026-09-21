import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Card, NavHeader, Screen, Segmented, Tag } from '@/components';
import {
  festivalsIn, formatBsNepali, formatClock, formatGregorian, startOfNepaliDay,
} from '@/lib/jyotish';
import { GUTTER, colors, space, type } from '@/theme';

/**
 * The festival year.
 *
 * Nepali festivals are fixed to tithis, not dates, so they move by up to
 * three weeks between years — a hardcoded list is stale the day it ships.
 * Every date here is found by searching the real lunation for the tithi the
 * festival is kept on.
 */
export default function FestivalsScreen() {
  const today = useMemo(() => startOfNepaliDay(new Date()), []);
  const [year, setYear] = useState(today.getFullYear());

  const festivals = useMemo(() => festivalsIn(year), [year]);
  const upcoming = festivals.filter((f) => f.date >= today);
  const next = upcoming[0];

  return (
    <Screen>
      <NavHeader title="Festivals" bordered />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {next && year === today.getFullYear() ? (
          <Card accent style={styles.card}>
            <Text style={styles.nextLabel}>Next</Text>
            <Text style={styles.nextName}>
              {next.name} <Text style={styles.nextNp}>{next.np}</Text>
            </Text>
            <Text style={styles.nextDate}>
              {formatGregorian(next.date)}
              {next.bs ? ` · ${formatBsNepali(next.bs)}` : ''}
            </Text>
            <Text style={styles.nextAbout}>{next.about}</Text>
            {next.sait ? (
              <Text style={styles.sait}>
                Tika sait {formatClock(next.sait.from)} – {formatClock(next.sait.to)}
              </Text>
            ) : null}
          </Card>
        ) : null}

        <View style={styles.segmented}>
          <Segmented
            value={`${year}`}
            onChange={(v) => setYear(Number(v))}
            options={[
              { value: `${today.getFullYear() - 1}`, label: `${today.getFullYear() - 1}` },
              { value: `${today.getFullYear()}`, label: `${today.getFullYear()}` },
              { value: `${today.getFullYear() + 1}`, label: `${today.getFullYear() + 1}` },
            ]}
          />
        </View>

        {festivals.map((festival) => {
          const past = festival.date < today;

          return (
            <Card key={festival.id} style={styles.card}>
              <View style={styles.head}>
                <View style={styles.headText}>
                  <Text style={[styles.name, past && styles.past]}>
                    {festival.name} <Text style={styles.np}>{festival.np}</Text>
                  </Text>
                  <Text style={[styles.date, past && styles.past]}>
                    {formatGregorian(festival.date)}
                    {festival.bs ? ` · ${festival.bs.day} ${festival.bs.monthName}` : ''}
                  </Text>
                </View>
                {festival.holiday ? <Tag label="Holiday" tone="accent" /> : null}
              </View>

              <Text style={styles.about}>{festival.about}</Text>

              {festival.sait ? (
                <View style={styles.saitBlock}>
                  <Text style={styles.saitTime}>
                    Tika sait {formatClock(festival.sait.from)} – {formatClock(festival.sait.to)}
                  </Text>
                  <Text style={styles.saitNote}>{festival.saitNote}</Text>
                </View>
              ) : null}
            </Card>
          );
        })}

        <Text style={styles.footnote}>
          Each date is found by searching for the tithi the festival is kept on, in the
          lunar month it belongs to. In a year with an adhik masa — a repeated lunar
          month — the first occurrence is taken, and those years are worth checking with
          an astrologer.
        </Text>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: space.lg, paddingBottom: space.xxl },
  card: { marginHorizontal: GUTTER, marginTop: space.md },
  segmented: { marginTop: space.lg, marginBottom: space.xs },
  nextLabel: { ...type.caption, color: colors.saffronDeep, textTransform: 'uppercase', letterSpacing: 0.6 },
  nextName: { ...type.display, color: colors.ink },
  nextNp: { ...type.title, color: colors.saffronDeep },
  nextDate: { ...type.body, color: colors.body },
  nextAbout: { ...type.small, color: colors.muted, marginTop: space.xs },
  sait: { ...type.label, color: colors.saffronDeep, marginTop: space.sm },
  head: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: space.md },
  headText: { flexShrink: 1 },
  name: { ...type.section, color: colors.ink },
  np: { ...type.small, color: colors.muted },
  date: { ...type.small, color: colors.saffronDeep },
  past: { color: colors.subtle },
  about: { ...type.small, color: colors.muted, marginTop: space.xs },
  saitBlock: { marginTop: space.sm, gap: 2 },
  saitTime: { ...type.label, color: colors.ink },
  saitNote: { ...type.caption, color: colors.muted },
  footnote: { ...type.small, color: colors.subtle, paddingHorizontal: GUTTER, marginTop: space.xl },
});
