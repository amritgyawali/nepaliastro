import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Card, DataRow, NavHeader, NeedsBirth, Screen } from '@/components';
import { GRAHAS, NUMBER_LORD, numerologyFor } from '@/lib/jyotish';
import { useOnboarding } from '@/store/onboarding';
import { GUTTER, colors, space, type } from '@/theme';

/** The Lo Shu order — the magic square every row, column and diagonal sums to 15. */
const LO_SHU_ORDER = [4, 9, 2, 3, 5, 7, 8, 1, 6];

/**
 * Ank jyotish.
 *
 * Numerology sits alongside jyotish here rather than apart from it: every
 * number is tied to its graha, so mulank 8 is Shani whether it arrived from a
 * birth date or from a chart, and the remedies are the same remedies.
 */
export default function NumerologyScreen() {
  const { profile } = useOnboarding();

  const reading = useMemo(
    () => (profile.birthDate ? numerologyFor(profile.birthDate, profile.name) : null),
    [profile.birthDate, profile.name],
  );

  if (!reading) {
    return (
      <Screen>
        <NavHeader title="Ank Jyotish" bordered />
        <NeedsBirth what="Your mulank comes from the day of the month you were born, and your bhagyank from the whole date." />
      </Screen>
    );
  }

  return (
    <Screen>
      <NavHeader title="Ank Jyotish" bordered />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Card accent style={styles.card}>
          <View style={styles.numbers}>
            <View style={styles.numberBlock}>
              <Text style={styles.bigNumber}>{reading.mulank}</Text>
              <Text style={styles.numberLabel}>Mulank</Text>
              <Text style={styles.numberLord}>{GRAHAS[reading.mulankLord].vedic}</Text>
            </View>
            <View style={styles.numberBlock}>
              <Text style={styles.bigNumber}>{reading.bhagyank}</Text>
              <Text style={styles.numberLabel}>Bhagyank</Text>
              <Text style={styles.numberLord}>{GRAHAS[reading.bhagyankLord].vedic}</Text>
            </View>
            {reading.namank ? (
              <View style={styles.numberBlock}>
                <Text style={styles.bigNumber}>{reading.namank}</Text>
                <Text style={styles.numberLabel}>Namank</Text>
                <Text style={styles.numberLord}>
                  {reading.namankLord ? GRAHAS[reading.namankLord].vedic : ''}
                </Text>
              </View>
            ) : null}
          </View>
          <Text style={styles.title}>{reading.traits.title}</Text>
        </Card>

        <Card title="How the two sit together" style={styles.card}>
          <Text style={styles.body}>{reading.harmony.note}</Text>
        </Card>

        <Card title="What mulank gives you" style={styles.card}>
          {reading.traits.strengths.map((line) => (
            <Text key={line} style={styles.bullet}>• {line}</Text>
          ))}
          <Text style={styles.watchTitle}>And what to watch</Text>
          {reading.traits.watch.map((line) => (
            <Text key={line} style={styles.bullet}>• {line}</Text>
          ))}
        </Card>

        <Card title="Lo Shu grid" subtitle="How often each digit falls in your birth date" style={styles.card}>
          <View style={styles.grid}>
            {LO_SHU_ORDER.map((digit) => {
              const count = reading.loShu[digit] ?? 0;
              return (
                <View
                  key={digit}
                  style={[styles.gridCell, count === 0 && styles.gridEmpty, count > 1 && styles.gridStrong]}
                >
                  <Text style={[styles.gridDigit, count === 0 && styles.gridDigitEmpty]}>
                    {count > 0 ? `${digit}`.repeat(count) : digit}
                  </Text>
                </View>
              );
            })}
          </View>

          {reading.missing.length ? (
            <Text style={styles.gridNote}>
              Missing: {reading.missing.join(', ')}. A missing number is a quality to
              build deliberately rather than one that comes free — the grahas behind
              them are {reading.missing.map((n) => GRAHAS[NUMBER_LORD[n]].vedic).join(', ')}.
            </Text>
          ) : (
            <Text style={styles.gridNote}>Every digit from one to nine appears — an unusually full grid.</Text>
          )}

          {reading.repeated.length ? (
            <Text style={styles.gridNote}>
              Repeated: {reading.repeated.join(', ')}. A repeated number is a quality you
              have more of than most, for better and worse.
            </Text>
          ) : null}
        </Card>

        <Card padded={false} style={styles.card}>
          <View style={styles.pad}>
            <DataRow label="Lucky numbers" value={reading.luckyNumbers.join(', ')} divided={false} />
            <DataRow label="Lucky colours" value={reading.luckyColours.join(', ')} />
            <DataRow label="Your strongest day" value={reading.luckyDay} />
          </View>
        </Card>

        <Text style={styles.footnote}>
          Letters are valued on the Chaldean system, which is the one Vedic numerology
          uses — it assigns no letter to nine, which is held to be whole in itself.
        </Text>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: space.lg, paddingBottom: space.xxl },
  card: { marginHorizontal: GUTTER, marginTop: space.md },
  pad: { paddingHorizontal: space.lg, paddingVertical: space.xs },
  numbers: { flexDirection: 'row', gap: space.xl },
  numberBlock: { alignItems: 'flex-start' },
  bigNumber: { ...type.display, fontSize: 44, lineHeight: 50, color: colors.ink },
  numberLabel: { ...type.label, color: colors.saffronDeep },
  numberLord: { ...type.caption, color: colors.muted },
  title: { ...type.section, color: colors.ink, marginTop: space.md },
  body: { ...type.body, color: colors.body },
  bullet: { ...type.small, color: colors.body, marginTop: space.xs },
  watchTitle: { ...type.label, color: colors.muted, marginTop: space.md },
  grid: { flexDirection: 'row', flexWrap: 'wrap', marginTop: space.sm },
  gridCell: {
    width: '33.33%', aspectRatio: 1.3, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: colors.divider,
  },
  gridEmpty: { backgroundColor: colors.canvas },
  gridStrong: { backgroundColor: colors.saffronSoft },
  gridDigit: { ...type.section, color: colors.ink },
  gridDigitEmpty: { color: colors.border },
  gridNote: { ...type.small, color: colors.muted, marginTop: space.md },
  footnote: { ...type.small, color: colors.subtle, paddingHorizontal: GUTTER, marginTop: space.xl },
});
