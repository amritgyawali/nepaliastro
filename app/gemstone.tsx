import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Card, DataRow, NavHeader, NeedsBirth, Screen, Tag } from '@/components';
import { chartFor, gemstoneFor, type Gemstone } from '@/lib/jyotish';
import { useOnboarding } from '@/store/onboarding';
import { GUTTER, colors, space, type } from '@/theme';

function StoneDetail({ stone }: { stone: Gemstone }) {
  return (
    <View style={styles.detail}>
      <DataRow label="Metal" value={stone.metal} divided={false} />
      <DataRow label="Finger" value={stone.finger} />
      <DataRow label="Weight" value={stone.ratti} />
      <DataRow label="Wear it first on" value={stone.day} />
      <DataRow label="Rudraksha" value={stone.rudraksha} />
      <DataRow label="Mantra" value={stone.mantra} note="108 times before first wearing" />
      <DataRow label="If it is out of reach" value={stone.alternates.join(', ')} />
    </View>
  );
}

/**
 * Ratna and rudraksha.
 *
 * The easiest recommendation in astrology to get wrong and the most
 * expensive: blue sapphire suits a few charts and harms many, and it is sold
 * to anyone who asks. So this works from the lagna — strengthening the lords
 * that carry the chart, never the lords of the houses that undo it — and the
 * stones to avoid are given as much space as the one to wear.
 */
export default function GemstoneScreen() {
  const { profile } = useOnboarding();
  const chart = useMemo(() => chartFor(profile), [profile]);
  const advice = useMemo(() => (chart ? gemstoneFor(chart) : null), [chart]);

  if (!chart || !advice) {
    return (
      <Screen>
        <NavHeader title="Ratna & Rudraksha" bordered />
        <NeedsBirth
          needsTime
          what="A stone is chosen from your lagna — the sign rising at your birth — so the wrong hour means the wrong stone."
        />
      </Screen>
    );
  }

  return (
    <Screen>
      <NavHeader title="Ratna & Rudraksha" bordered />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Card accent style={styles.card}>
          <Text style={styles.label}>Wear this one</Text>
          <Text style={styles.stoneName}>
            {advice.primary.name} <Text style={styles.stoneNp}>{advice.primary.np}</Text>
          </Text>
          <Text style={styles.reason}>{advice.primaryReason}</Text>
        </Card>

        <Card padded={false} style={styles.card}>
          <StoneDetail stone={advice.primary} />
        </Card>

        {advice.supporting ? (
          <>
            <Text style={styles.sectionTitle}>And supporting it</Text>
            <Card style={styles.card}>
              <Text style={styles.stoneNameSmall}>
                {advice.supporting.name} <Text style={styles.stoneNp}>{advice.supporting.np}</Text>
              </Text>
              <Text style={styles.reason}>{advice.supportingReason}</Text>
              <StoneDetail stone={advice.supporting} />
            </Card>
          </>
        ) : null}

        {advice.avoid.length ? (
          <>
            <Text style={styles.sectionTitle}>Do not wear these</Text>
            <Card style={styles.card}>
              {advice.avoid.map(({ stone, reason }) => (
                <View key={stone.graha} style={styles.avoidRow}>
                  <View style={styles.avoidHead}>
                    <Text style={styles.avoidName}>
                      {stone.name} · {stone.np}
                    </Text>
                    <Tag label="Avoid" tone="bad" />
                  </View>
                  <Text style={styles.avoidReason}>{reason}</Text>
                </View>
              ))}
            </Card>
          </>
        ) : null}

        <Card title="Rudraksha, which is safe for anyone" style={styles.card}>
          <Text style={styles.body}>
            {advice.rudraksha} suits your chart. Unlike a gemstone, a rudraksha is not
            held to harm a chart it does not suit — it is the one thing here that can be
            worn without a reading.
          </Text>
        </Card>

        <Card style={styles.card}>
          <Text style={styles.caution}>{advice.caution}</Text>
        </Card>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: space.lg, paddingBottom: space.xxl },
  card: { marginHorizontal: GUTTER, marginTop: space.md },
  detail: { paddingHorizontal: space.lg, paddingVertical: space.xs },
  label: { ...type.caption, color: colors.saffronDeep, textTransform: 'uppercase', letterSpacing: 0.6 },
  stoneName: { ...type.display, color: colors.ink },
  stoneNameSmall: { ...type.section, color: colors.ink },
  stoneNp: { ...type.title, color: colors.saffronDeep },
  reason: { ...type.body, color: colors.body, marginTop: space.xs },
  sectionTitle: { ...type.section, color: colors.ink, paddingHorizontal: GUTTER, marginTop: space.xl },
  avoidRow: { marginBottom: space.md },
  avoidHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: space.md },
  avoidName: { ...type.label, color: colors.ink, flexShrink: 1 },
  avoidReason: { ...type.small, color: colors.muted, marginTop: 2 },
  body: { ...type.body, color: colors.body },
  caution: { ...type.small, color: colors.muted },
});
