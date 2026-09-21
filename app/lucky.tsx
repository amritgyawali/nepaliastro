import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Card, DataRow, NavHeader, Screen } from '@/components';
import {
  GRAHAS, RASHIS, chartFor, formatGregorian, luckyFor, luckyForRashi,
} from '@/lib/jyotish';
import { useOnboarding } from '@/store/onboarding';
import { GUTTER, colors, radius, space, type } from '@/theme';

/**
 * Shubha rang and shubha ank.
 *
 * The most-asked and most-carelessly-answered question in the app. This one
 * changes daily, because it follows the lord of the weekday and the lord of
 * the nakshatra the moon is crossing — and it differs between two people on
 * the same day, because their own sign lords differ.
 */
export default function LuckyScreen() {
  const { profile } = useOnboarding();
  const now = useMemo(() => new Date(), []);
  const chart = useMemo(() => chartFor(profile), [profile]);
  const lucky = useMemo(() => luckyFor(now, chart), [now, chart]);

  return (
    <Screen>
      <NavHeader title="Lucky colour & number" bordered />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Card accent style={styles.card}>
          <Text style={styles.label}>Today — {formatGregorian(now)}</Text>

          <View style={styles.swatchRow}>
            {lucky.swatch.map((hex, i) => (
              <View key={hex + i} style={[styles.swatch, { backgroundColor: hex }]} />
            ))}
          </View>

          <Text style={styles.colours}>{lucky.colours.join(' · ')}</Text>
          <Text style={styles.np}>{lucky.colourNp}</Text>
          <Text style={styles.reason}>{lucky.reason}</Text>
        </Card>

        <Card padded={false} style={styles.card}>
          <View style={styles.pad}>
            <DataRow
              label="Lucky numbers"
              value={lucky.numbers.join(', ')}
              note={`From ${GRAHAS[lucky.dayLord].vedic} and ${GRAHAS[lucky.starLord].vedic}`}
              divided={false}
            />
            <DataRow label="Direction" value={lucky.direction} note="Face this way for anything that matters today" />
            <DataRow label="Metal" value={lucky.metal} />
            <DataRow
              label="Day lord"
              value={GRAHAS[lucky.dayLord].vedic}
              note="Whose day it is — everyone shares this"
            />
            <DataRow
              label="Star lord"
              value={GRAHAS[lucky.starLord].vedic}
              note="Lord of the nakshatra the moon is crossing — this changes about once a day"
            />
          </View>
        </Card>

        {lucky.personal ? (
          <Card title="Yours in particular" style={styles.card}>
            <Text style={styles.body}>
              Your moon sign {chart?.rashi.vedic} is ruled by{' '}
              {GRAHAS[lucky.personal.rashiLord].vedic}, so{' '}
              {lucky.personal.rashiColour.join(', ').toLowerCase()} suit you on any day,
              not only today.
            </Text>
            <Text style={styles.avoid}>
              Leave off: {lucky.personal.avoid.join(', ').toLowerCase()} — these belong to
              the lords of the difficult houses from your moon.
            </Text>
          </Card>
        ) : (
          <Card style={styles.card}>
            <Text style={styles.body}>
              Add your birth date and this page will also give the colours tied to your
              own moon sign, and the ones worth leaving off.
            </Text>
          </Card>
        )}

        <Text style={styles.sectionTitle}>By rashi</Text>
        <Card padded={false} style={styles.card}>
          {RASHIS.map((rashi, index) => {
            const set = luckyForRashi(rashi.index);
            const isYours = chart?.rashi.index === rashi.index;

            return (
              <View
                key={rashi.index}
                style={[styles.rashiRow, index > 0 && styles.divided, isYours && styles.yours]}
              >
                <Text style={styles.rashiGlyph}>{rashi.glyph}</Text>
                <View style={styles.rashiText}>
                  <Text style={styles.rashiName}>
                    {rashi.vedic} <Text style={styles.rashiNp}>{rashi.np}</Text>
                  </Text>
                  <Text style={styles.rashiDetail}>
                    {set.colours.join(', ')} · {set.numbers.join(', ')} · {set.day}
                  </Text>
                </View>
                <View style={styles.rashiSwatches}>
                  {set.swatch.slice(0, 3).map((hex, i) => (
                    <View key={hex + i} style={[styles.miniSwatch, { backgroundColor: hex }]} />
                  ))}
                </View>
              </View>
            );
          })}
        </Card>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: space.lg, paddingBottom: space.xxl },
  card: { marginHorizontal: GUTTER, marginTop: space.md },
  pad: { paddingHorizontal: space.lg, paddingVertical: space.xs },
  label: { ...type.caption, color: colors.saffronDeep, textTransform: 'uppercase', letterSpacing: 0.6 },
  swatchRow: { flexDirection: 'row', gap: space.sm, marginTop: space.md },
  swatch: { width: 56, height: 56, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border },
  colours: { ...type.display, color: colors.ink, marginTop: space.md },
  np: { ...type.title, color: colors.saffronDeep },
  reason: { ...type.small, color: colors.body, marginTop: space.sm },
  body: { ...type.body, color: colors.body },
  avoid: { ...type.small, color: colors.muted, marginTop: space.sm },
  sectionTitle: { ...type.section, color: colors.ink, paddingHorizontal: GUTTER, marginTop: space.xl },
  rashiRow: {
    flexDirection: 'row', alignItems: 'center', gap: space.md,
    paddingHorizontal: space.lg, paddingVertical: space.md,
  },
  divided: { borderTopWidth: 1, borderTopColor: colors.divider },
  yours: { backgroundColor: colors.saffronSoft },
  rashiGlyph: { fontSize: 20, color: colors.saffronDeep, width: 24 },
  rashiText: { flex: 1 },
  rashiName: { ...type.label, color: colors.ink },
  rashiNp: { ...type.caption, color: colors.subtle },
  rashiDetail: { ...type.small, color: colors.muted },
  rashiSwatches: { flexDirection: 'row', gap: 3 },
  miniSwatch: { width: 14, height: 14, borderRadius: 3, borderWidth: 1, borderColor: colors.border },
});
