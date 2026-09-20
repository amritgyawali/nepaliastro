import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import type { Panchang } from '@/lib/panchang';
import { GUTTER, colors, radius, space, type } from '@/theme';

import { SectionHeader } from '../SectionHeader';

type TodayPanchangProps = {
  panchang: Panchang;
  /** "Sun 20 Sep" — the day these figures belong to. */
  dateLabel: string;
};

/** The four figures a reader checks before planning the day. */
export function TodayPanchang({ panchang, dateLabel }: TodayPanchangProps) {
  const cells = [
    { id: 'sunrise', label: 'Sunrise', value: panchang.sun.sunrise },
    { id: 'sunset', label: 'Sunset', value: panchang.sun.sunset },
    {
      id: 'tithi',
      label: 'Tithi',
      value: `${panchang.tithi.paksha} ${panchang.tithi.name}`,
    },
    { id: 'nakshatra', label: 'Nakshatra', value: panchang.nakshatra.name },
  ];

  return (
    <View style={styles.section}>
      <SectionHeader title="Today’s Panchang" />

      <View style={styles.card}>
        <Text style={styles.place}>
          {panchang.place} · {dateLabel}
        </Text>

        <View style={styles.grid}>
          {cells.map((cell) => (
            <View key={cell.id} style={styles.cell}>
              <Text style={styles.label}>{cell.label}</Text>
              <Text style={styles.value} numberOfLines={1}>
                {cell.value}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginTop: space.xl,
  },
  card: {
    marginHorizontal: GUTTER,
    padding: space.lg,
    backgroundColor: colors.saffronSoft,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.saffronBorder,
  },
  place: {
    ...type.caption,
    color: colors.saffronDeep,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: space.md,
    rowGap: space.md,
  },
  cell: {
    width: '50%',
    paddingRight: space.md,
  },
  label: {
    ...type.caption,
    color: colors.muted,
  },
  value: {
    ...type.label,
    color: colors.ink,
  },
});
