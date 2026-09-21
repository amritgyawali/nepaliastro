import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Card, NavHeader, ScoreBar, Screen, Segmented, Tappable } from '@/components';
import {
  GRAHAS, RASHIS, chartFor, rashifalFor, todayHeadline, type Period,
} from '@/lib/jyotish';
import { useOnboarding } from '@/store/onboarding';
import { GUTTER, colors, radius, space, type } from '@/theme';

const PERIODS: { value: Period; label: string }[] = [
  { value: 'daily', label: 'Today' },
  { value: 'weekly', label: 'Week' },
  { value: 'monthly', label: 'Month' },
  { value: 'yearly', label: 'Year' },
];

/**
 * Rashifal.
 *
 * The sign opens on the reader's own moon sign where one is known, because
 * that is the sign Vedic astrology reads a person by — not the sun sign a
 * western horoscope uses. All twelve are one tap away, and every line is
 * computed from where the grahas stand today rather than written ahead.
 */
export default function HoroscopeScreen() {
  const { profile } = useOnboarding();
  const now = useMemo(() => new Date(), []);
  const chart = useMemo(() => chartFor(profile), [profile]);

  const [selected, setSelected] = useState(() => chart?.rashi.index ?? 0);
  const [period, setPeriod] = useState<Period>('daily');

  const reading = useMemo(
    () => rashifalFor(selected, period, now),
    [selected, period, now],
  );

  return (
    <Screen>
      <NavHeader title="Rashifal" bordered />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.today}>{todayHeadline(now)}</Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.signRow}
        >
          {RASHIS.map((rashi) => {
            const active = rashi.index === selected;
            const isYours = chart?.rashi.index === rashi.index;

            return (
              <Tappable
                key={rashi.index}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                accessibilityLabel={`${rashi.vedic}, ${rashi.western}${isYours ? ', your sign' : ''}`}
                onPress={() => setSelected(rashi.index)}
                style={[styles.sign, active && styles.signActive]}
                pressedStyle={styles.pressed}
              >
                <Text style={[styles.glyph, active && styles.signActiveText]}>{rashi.glyph}</Text>
                <Text style={[styles.signName, active && styles.signActiveText]} numberOfLines={1}>
                  {rashi.vedic}
                </Text>
                {isYours ? <View style={styles.yoursDot} /> : null}
              </Tappable>
            );
          })}
        </ScrollView>

        <View style={styles.segmented}>
          <Segmented value={period} onChange={setPeriod} options={PERIODS} />
        </View>

        <Card accent style={styles.card}>
          <Text style={styles.rashiName}>
            {reading.rashi} <Text style={styles.rashiNp}>{reading.np}</Text>
          </Text>
          <Text style={styles.rashiWestern}>
            {reading.western} · ruled by {GRAHAS[reading.lord].vedic}
          </Text>
          <Text style={styles.headline}>{reading.headline}</Text>
          <View style={styles.scoreWrap}>
            <ScoreBar value={reading.score} label="Overall" caption={`${reading.score} / 100`} />
          </View>
        </Card>

        {reading.sections.map((section) => (
          <Card key={section.title} style={styles.card}>
            <View style={styles.sectionHead}>
              <Text style={styles.sectionTitle}>{section.title}</Text>
              <Text style={styles.stars}>
                {'★'.repeat(section.rating)}
                <Text style={styles.starsDim}>{'★'.repeat(5 - section.rating)}</Text>
              </Text>
            </View>
            <Text style={styles.sectionBody}>{section.body}</Text>
          </Card>
        ))}

        <Card title="Lucky today" style={styles.card}>
          <View style={styles.swatchRow}>
            {reading.luckySwatch.map((hex, i) => (
              <View key={hex + i} style={[styles.swatch, { backgroundColor: hex }]} />
            ))}
            <Text style={styles.luckyText}>{reading.luckyColours.join(', ')}</Text>
          </View>
          <Text style={styles.luckyLine}>
            Numbers {reading.luckyNumbers.join(', ')} · direction {reading.luckyDirection}
          </Text>
        </Card>

        <Card title="What this was read from" style={styles.card}>
          {reading.basis.map((t) => (
            <Text key={t.graha} style={styles.basis}>
              • {t.name} in {t.rashi}, your {t.house}th{t.retrograde ? ', retrograde' : ''}
            </Text>
          ))}
          <Text style={styles.basisNote}>
            Nothing here is written in advance. The lines above follow from these
            positions, counted from {reading.rashi} — which is why the same day reads
            differently for a different sign.
          </Text>
        </Card>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: space.lg, paddingBottom: space.xxl },
  today: { ...type.small, color: colors.muted, paddingHorizontal: GUTTER, marginBottom: space.md },
  signRow: { paddingHorizontal: GUTTER, gap: space.sm },
  sign: {
    width: 68, paddingVertical: space.sm, alignItems: 'center', gap: 2,
    borderRadius: radius.md, borderWidth: 1, borderColor: colors.border,
    backgroundColor: colors.white,
  },
  signActive: { backgroundColor: colors.saffron, borderColor: colors.saffron },
  signActiveText: { color: colors.onSaffron },
  pressed: { opacity: 0.6 },
  glyph: { fontSize: 20, color: colors.saffronDeep },
  signName: { ...type.caption, color: colors.body },
  yoursDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: colors.saffronDeep },
  segmented: { marginTop: space.lg },
  card: { marginHorizontal: GUTTER, marginTop: space.md },
  rashiName: { ...type.display, color: colors.ink },
  rashiNp: { ...type.title, color: colors.saffronDeep },
  rashiWestern: { ...type.small, color: colors.muted },
  headline: { ...type.body, color: colors.body, marginTop: space.sm },
  scoreWrap: { marginTop: space.lg },
  sectionHead: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', gap: space.sm },
  sectionTitle: { ...type.section, color: colors.ink },
  stars: { ...type.small, color: colors.saffron },
  starsDim: { color: colors.border },
  sectionBody: { ...type.body, color: colors.body, marginTop: space.xs },
  swatchRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm, marginTop: space.sm },
  swatch: { width: 26, height: 26, borderRadius: radius.sm, borderWidth: 1, borderColor: colors.border },
  luckyText: { ...type.small, color: colors.body, flexShrink: 1 },
  luckyLine: { ...type.small, color: colors.muted, marginTop: space.sm },
  basis: { ...type.small, color: colors.body },
  basisNote: { ...type.small, color: colors.muted, marginTop: space.sm },
});
