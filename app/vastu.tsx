import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Card, NavHeader, Screen, Segmented } from '@/components';
import { GRAHAS, chartFor, vastuFor } from '@/lib/jyotish';
import { useOnboarding } from '@/store/onboarding';
import { GUTTER, colors, space, type } from '@/theme';

type VastuView = 'rooms' | 'directions';

/**
 * Vastu.
 *
 * Geometry and directions rather than planets, so almost none of this is
 * computed. What a chart adds is a direction to favour — the one belonging
 * to the lagna lord — and a short list of the grahas genuinely weak in the
 * chart, so household remedies are aimed where they are needed rather than
 * scattered over every corner of the house.
 */
export default function VastuScreen() {
  const { profile } = useOnboarding();
  const [view, setView] = useState<VastuView>('rooms');

  const chart = useMemo(() => chartFor(profile), [profile]);
  const reading = useMemo(() => vastuFor(chart), [chart]);

  return (
    <Screen>
      <NavHeader title="Vastu" bordered />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {reading.personal ? (
          <Card accent style={styles.card}>
            <Text style={styles.label}>Your direction</Text>
            <Text style={styles.direction}>{reading.personal.favourableDirection}</Text>
            <Text style={styles.reason}>{reading.personal.reason}</Text>

            {reading.personal.weakGrahas.length ? (
              <View style={styles.weakBlock}>
                <Text style={styles.weakTitle}>Corners worth attention in your chart</Text>
                {reading.personal.weakGrahas.map((g) => (
                  <Text key={g.graha} style={styles.weakLine}>
                    • {g.name} is weak — {g.remedy}
                  </Text>
                ))}
              </View>
            ) : null}
          </Card>
        ) : (
          <Card style={styles.card}>
            <Text style={styles.body}>
              Add your birth details and this page will also name the direction your
              lagna lord favours, and the corners of the house worth attention in your
              particular chart.
            </Text>
          </Card>
        )}

        <View style={styles.segmented}>
          <Segmented
            value={view}
            onChange={setView}
            options={[
              { value: 'rooms', label: 'By room' },
              { value: 'directions', label: 'By direction' },
            ]}
          />
        </View>

        {view === 'rooms'
          ? reading.rooms.map((room) => (
              <Card key={room.room} style={styles.card}>
                <Text style={styles.name}>
                  {room.room} <Text style={styles.np}>{room.np}</Text>
                </Text>
                <Text style={styles.best}>Best: {room.best.join(', ')}</Text>
                <Text style={styles.avoid}>Avoid: {room.avoid.join(', ')}</Text>
                <Text style={styles.note}>{room.note}</Text>
              </Card>
            ))
          : reading.directions.map((direction) => (
              <Card key={direction.id} style={styles.card}>
                <Text style={styles.name}>
                  {direction.name} <Text style={styles.np}>{direction.np}</Text>
                </Text>
                <Text style={styles.meta}>
                  {direction.lord} · {direction.element} · {GRAHAS[direction.graha].vedic}
                </Text>
                <Text style={styles.blockTitle}>Put here</Text>
                {direction.best.map((line) => (
                  <Text key={line} style={styles.bullet}>• {line}</Text>
                ))}
                <Text style={styles.blockTitle}>Keep out</Text>
                {direction.avoid.map((line) => (
                  <Text key={line} style={styles.bullet}>• {line}</Text>
                ))}
              </Card>
            ))}

        <Text style={styles.footnote}>
          Vastu is guidance about a building, not a verdict on one. Few houses in
          Kathmandu satisfy every rule, and the usual advice is to fix the north-east
          and the south-west first and let the rest be.
        </Text>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: space.lg, paddingBottom: space.xxl },
  card: { marginHorizontal: GUTTER, marginTop: space.md },
  segmented: { marginTop: space.lg },
  label: { ...type.caption, color: colors.saffronDeep, textTransform: 'uppercase', letterSpacing: 0.6 },
  direction: { ...type.display, color: colors.ink },
  reason: { ...type.body, color: colors.body, marginTop: space.xs },
  weakBlock: { marginTop: space.lg, gap: space.xs },
  weakTitle: { ...type.label, color: colors.muted },
  weakLine: { ...type.small, color: colors.body },
  body: { ...type.body, color: colors.body },
  name: { ...type.section, color: colors.ink },
  np: { ...type.small, color: colors.saffronDeep },
  meta: { ...type.caption, color: colors.muted },
  best: { ...type.small, color: colors.green, marginTop: space.xs },
  avoid: { ...type.small, color: colors.red, marginTop: 2 },
  note: { ...type.small, color: colors.muted, marginTop: space.sm },
  blockTitle: { ...type.caption, color: colors.muted, textTransform: 'uppercase', letterSpacing: 0.6, marginTop: space.md },
  bullet: { ...type.small, color: colors.body },
  footnote: { ...type.small, color: colors.subtle, paddingHorizontal: GUTTER, marginTop: space.xl },
});
