import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import {
  Card, DataRow, KundliDiagram, NavHeader, NeedsBirth, PrimaryButton, Screen,
  Segmented, Tag, type DiagramHouse,
} from '@/components';
import {
  GRAHAS, GRAHA_ORDER, HOUSE_MEANINGS, RASHIS, VARGAS, chartFor, describeBirth, vargaSign,
  type VargaId,
} from '@/lib/jyotish';
import { useOnboarding } from '@/store/onboarding';
import { GUTTER, colors, space, type } from '@/theme';

/**
 * The janma kundali — the chart itself.
 *
 * Everything else in the app is derived from this screen's numbers, so it
 * shows its working: each graha's exact degree, the nakshatra it falls in,
 * its dignity, and whether it is retrograde or combust. The divisional
 * charts are on the same screen rather than behind a paywall, because a
 * navamsa is half of what an astrologer looks at.
 */
export default function KundliScreen() {
  const router = useRouter();
  const { profile } = useOnboarding();
  const [varga, setVarga] = useState<VargaId>('D1');

  const chart = useMemo(() => chartFor(profile), [profile]);

  if (!chart) {
    return (
      <Screen>
        <NavHeader title="Janma Kundali" bordered />
        <NeedsBirth what="Your birth chart is drawn from the exact moment and place you were born." />
      </Screen>
    );
  }

  // In a divisional chart the houses are recounted from that chart's own
  // ascendant, which is why a graha moves house between D1 and D9.
  const vargaLagna = vargaSign(varga, chart.ascendant);
  const houses: DiagramHouse[] = Array.from({ length: 12 }, (_, i) => {
    const signIndex = (vargaLagna + i) % 12;
    const grahas = GRAHA_ORDER.filter(
      (id) => vargaSign(varga, chart.grahas[id].longitude) === signIndex,
    );
    return {
      house: i + 1,
      rashiNumber: signIndex + 1,
      grahas: grahas.map((id) => chart.grahas[id].graha.short),
      retrograde: grahas
        .filter((id) => chart.grahas[id].retrograde && !chart.grahas[id].graha.shadow)
        .map((id) => chart.grahas[id].graha.short),
    };
  });

  const activeVarga = VARGAS.find((v) => v.id === varga);

  return (
    <Screen>
      <NavHeader title="Janma Kundali" bordered />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.birth}>{describeBirth(chart.moment)}</Text>

        {chart.approximate ? (
          <Card style={styles.warning}>
            <Text style={styles.warningTitle}>Drawn for noon</Text>
            <Text style={styles.warningBody}>
              Without a birth time the ascendant and the houses cannot be placed. The
              moon sign, nakshatra and dasha below are still reliable; the chart
              diagram is not.
            </Text>
          </Card>
        ) : null}

        <View style={styles.diagram}>
          <KundliDiagram houses={houses} size={300} caption={varga} />
          <Text style={styles.diagramNote}>
            The number in each house is its sign — 1 is Mesha, 12 is Meena.
          </Text>
        </View>

        <Segmented
          scrollable
          value={varga}
          onChange={setVarga}
          options={VARGAS.map((v) => ({ value: v.id, label: v.id }))}
        />
        {activeVarga ? (
          <Text style={styles.vargaAbout}>
            <Text style={styles.vargaName}>{activeVarga.name}</Text> — {activeVarga.about}
          </Text>
        ) : null}

        <Card title="The essentials" style={styles.card}>
          <DataRow
            label="Lagna (ascendant)"
            value={chart.approximate ? 'Needs birth time' : chart.lagna.vedic}
            note={chart.approximate ? undefined : `${chart.lagna.western} rising, ruled by ${GRAHAS[chart.lagna.lord].vedic}`}
            divided={false}
          />
          <DataRow
            label="Rashi (moon sign)"
            value={chart.rashi.vedic}
            note="What a Nepali means by “my rashi” — the sign the moon stood in"
          />
          <DataRow
            label="Nakshatra"
            value={`${chart.nakshatra.name}, pada ${chart.pada}`}
            note={`${chart.nakshatra.deity} presides. Dasha lord: ${GRAHAS[chart.nakshatra.lord].vedic}`}
          />
          <DataRow
            label="Sun sign"
            value={chart.sunRashi.vedic}
            note="Sidereal — not the same as the western sun sign"
          />
          <DataRow label="Gana" value={chart.nakshatra.gana} note={`Yoni ${chart.nakshatra.yoni}, nadi ${chart.nakshatra.nadi}`} />
        </Card>

        <Text style={styles.sectionTitle}>The nine grahas</Text>
        <Card padded={false} style={styles.card}>
          {GRAHA_ORDER.map((id, index) => {
            const g = chart.grahas[id];
            const flags = [
              g.retrograde && !g.graha.shadow ? 'Retrograde' : null,
              g.combust ? 'Combust' : null,
            ].filter(Boolean);

            return (
              <View key={id} style={[styles.grahaRow, index > 0 && styles.grahaDivider]}>
                <View style={styles.grahaHead}>
                  <Text style={styles.grahaName}>{g.graha.vedic}</Text>
                  <Text style={styles.grahaPosition}>
                    {g.degreeLabel} {RASHIS[g.rashi].vedic}
                  </Text>
                </View>
                <Text style={styles.grahaDetail}>
                  House {g.house} · {g.nakshatraMeta.name} pada {g.pada}
                  {flags.length ? ` · ${flags.join(', ')}` : ''}
                </Text>
                <View style={styles.tagRow}>
                  <Tag
                    label={g.dignity}
                    tone={
                      ['Exalted', 'Own sign', 'Moolatrikona'].includes(g.dignity)
                        ? 'good'
                        : g.dignity === 'Debilitated'
                          ? 'bad'
                          : 'neutral'
                    }
                  />
                  {g.combust ? <Tag label="Combust" tone="bad" /> : null}
                  {g.retrograde && !g.graha.shadow ? <Tag label="Retrograde" tone="accent" /> : null}
                </View>
              </View>
            );
          })}
        </Card>

        <Text style={styles.sectionTitle}>The twelve houses</Text>
        <Card padded={false} style={styles.card}>
          {chart.houses.map((house, index) => (
            <View key={house.house} style={[styles.houseRow, index > 0 && styles.grahaDivider]}>
              <Text style={styles.houseNumber}>{house.house}</Text>
              <View style={styles.houseText}>
                <Text style={styles.houseName}>
                  {HOUSE_MEANINGS[house.house - 1].name} · {house.rashi.vedic}
                </Text>
                <Text style={styles.houseAbout}>{HOUSE_MEANINGS[house.house - 1].about}</Text>
                {house.grahas.length ? (
                  <Text style={styles.houseGrahas}>
                    {house.grahas.map((g) => g.graha.vedic).join(', ')}
                  </Text>
                ) : null}
              </View>
            </View>
          ))}
        </Card>

        <PrimaryButton
          label="See your graha dasha"
          onPress={() => router.push('/dasha')}
          style={styles.cta}
        />
        <PrimaryButton
          label="Check for doshas"
          variant="outline"
          onPress={() => router.push('/dosha')}
          style={styles.ctaSecond}
        />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: space.lg, paddingBottom: space.xxl },
  birth: { ...type.small, color: colors.muted, paddingHorizontal: GUTTER },
  warning: { marginHorizontal: GUTTER, marginTop: space.md, backgroundColor: colors.redSoft, borderColor: colors.redSoft },
  warningTitle: { ...type.label, color: colors.red },
  warningBody: { ...type.small, color: colors.body, marginTop: 2 },
  diagram: { marginTop: space.lg, marginBottom: space.lg },
  diagramNote: { ...type.caption, color: colors.subtle, marginTop: space.sm, textAlign: 'center' },
  vargaAbout: { ...type.small, color: colors.muted, paddingHorizontal: GUTTER, marginTop: space.md },
  vargaName: { ...type.label, color: colors.ink },
  card: { marginHorizontal: GUTTER, marginTop: space.md },
  sectionTitle: { ...type.section, color: colors.ink, paddingHorizontal: GUTTER, marginTop: space.xl },
  grahaRow: { paddingHorizontal: space.lg, paddingVertical: space.md },
  grahaDivider: { borderTopWidth: 1, borderTopColor: colors.divider },
  grahaHead: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', gap: space.sm },
  grahaName: { ...type.label, color: colors.ink },
  grahaPosition: { ...type.small, color: colors.muted, flexShrink: 1, textAlign: 'right' },
  grahaDetail: { ...type.small, color: colors.muted, marginTop: 1 },
  tagRow: { flexDirection: 'row', gap: space.xs, marginTop: space.sm, flexWrap: 'wrap' },
  houseRow: { flexDirection: 'row', gap: space.md, paddingHorizontal: space.lg, paddingVertical: space.md },
  houseNumber: { ...type.title, color: colors.saffronBorder, width: 28 },
  houseText: { flex: 1 },
  houseName: { ...type.label, color: colors.ink },
  houseAbout: { ...type.small, color: colors.muted },
  houseGrahas: { ...type.small, color: colors.saffronDeep, marginTop: 2 },
  cta: { marginHorizontal: GUTTER, marginTop: space.xl },
  ctaSecond: { marginHorizontal: GUTTER, marginTop: space.sm },
});
