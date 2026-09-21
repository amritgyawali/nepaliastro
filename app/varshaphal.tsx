import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Card, DataRow, KundliDiagram, NavHeader, NeedsBirth, Screen, Segmented, type DiagramHouse } from '@/components';
import {
  GRAHA_ORDER, chartFor, formatClock, formatGregorian, placeOf, varshaphalFor,
} from '@/lib/jyotish';
import { useOnboarding } from '@/store/onboarding';
import { GUTTER, colors, space, type } from '@/theme';

/**
 * Varshaphal — the year ahead.
 *
 * The Tajik system asks a narrower question than the birth chart: not what a
 * life holds but what this one year holds. The year begins at the instant the
 * sun comes back to the exact degree it held at birth, which is rarely the
 * birthday and can fall a day either side of it.
 */
export default function VarshaphalScreen() {
  const { profile } = useOnboarding();
  const thisYear = new Date().getFullYear();
  const [year, setYear] = useState(thisYear);

  const chart = useMemo(() => chartFor(profile), [profile]);
  const place = useMemo(() => placeOf(profile), [profile]);
  const varsha = useMemo(
    () => (chart ? varshaphalFor(chart, year, place) : null),
    [chart, year, place],
  );

  if (!chart || !varsha) {
    return (
      <Screen>
        <NavHeader title="Varshaphal" bordered />
        <NeedsBirth
          needsTime
          what="The year's chart is cast for the moment the sun returns to its birth degree, and its ascendant needs your birth time."
        />
      </Screen>
    );
  }

  const yearChart = varsha.chart;
  const houses: DiagramHouse[] = yearChart.houses.map((house) => ({
    house: house.house,
    rashiNumber: house.rashi.index + 1,
    grahas: house.grahas.map((g) => g.graha.short),
    retrograde: house.grahas
      .filter((g) => g.retrograde && !g.graha.shadow)
      .map((g) => g.graha.short),
  }));

  return (
    <Screen>
      <NavHeader title="Varshaphal" bordered />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Segmented
          scrollable
          value={`${year}`}
          onChange={(v) => setYear(Number(v))}
          options={Array.from({ length: 6 }, (_, i) => ({
            value: `${thisYear - 1 + i}`,
            label: `${thisYear - 1 + i}`,
          }))}
        />

        <Card accent style={styles.card}>
          <Text style={styles.label}>Your {varsha.age}th year begins</Text>
          <Text style={styles.begins}>{formatGregorian(varsha.beginsAt)}</Text>
          <Text style={styles.beginsTime}>
            at {formatClock(varsha.beginsAt)} — the moment the sun returns to its birth degree
          </Text>
        </Card>

        <View style={styles.diagram}>
          <KundliDiagram houses={houses} size={280} caption={`${year}`} />
        </View>

        <Card padded={false} style={styles.card}>
          <View style={styles.pad}>
            <DataRow
              label="Varsha lagna"
              value={yearChart.lagna.vedic}
              note="The sign rising at the moment the year turned"
              divided={false}
            />
            <DataRow
              label="Muntha"
              value={`${varsha.muntha.rashi}, ${varsha.muntha.house}th house`}
              note={varsha.muntha.about}
            />
            <DataRow
              label="Year lord"
              value={varsha.yearLord.name}
              note={`Chosen as the strongest of the candidates — ${varsha.yearLord.reason}`}
            />
            <DataRow label="Year's moon sign" value={yearChart.rashi.vedic} />
            <DataRow label="Year's nakshatra" value={yearChart.nakshatra.name} />
          </View>
        </Card>

        <Card title="What the year turns on" style={styles.card}>
          {varsha.highlights.map((line) => (
            <Text key={line} style={styles.bullet}>• {line}</Text>
          ))}
        </Card>

        <Card title="The grahas in the year's chart" style={styles.card}>
          {GRAHA_ORDER.map((id) => {
            const g = yearChart.grahas[id];
            return (
              <View key={id} style={styles.grahaRow}>
                <Text style={styles.grahaName}>{g.graha.vedic}</Text>
                <Text style={styles.grahaDetail}>
                  {g.house}th · {g.dignity}
                  {g.retrograde && !g.graha.shadow ? ' · retrograde' : ''}
                </Text>
              </View>
            );
          })}
        </Card>

        <Text style={styles.footnote}>
          The varsha chart is cast for where you live now rather than where you were
          born — the Tajik convention, and it matters for anyone who has moved abroad.
          This one is drawn for {place.name}.
        </Text>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: space.lg, paddingBottom: space.xxl },
  card: { marginHorizontal: GUTTER, marginTop: space.md },
  pad: { paddingHorizontal: space.lg, paddingVertical: space.xs },
  label: { ...type.caption, color: colors.saffronDeep, textTransform: 'uppercase', letterSpacing: 0.6 },
  begins: { ...type.display, color: colors.ink },
  beginsTime: { ...type.small, color: colors.body },
  diagram: { marginTop: space.lg },
  bullet: { ...type.body, color: colors.body, marginTop: space.xs },
  grahaRow: {
    flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between',
    gap: space.md, paddingVertical: space.xs,
  },
  grahaName: { ...type.label, color: colors.ink },
  grahaDetail: { ...type.small, color: colors.muted },
  footnote: { ...type.small, color: colors.subtle, paddingHorizontal: GUTTER, marginTop: space.xl },
});
