import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { formatClock, type Panchang } from '@/lib/jyotish';
import { GUTTER, colors, radius, space, type } from '@/theme';

import { SectionHeader } from '../SectionHeader';

type TodayPanchangProps = {
  panchang: Panchang;
  /** "Sun 20 Sep" — the day these figures belong to. */
  dateLabel: string;
  /** Opens the full panchang, with what each figure is for. */
  onSeeAll?: () => void;
};

/** The four figures a reader checks before planning the day. */
export function TodayPanchang({ panchang, dateLabel, onSeeAll }: TodayPanchangProps) {
  const cells = [
    { id: 'sunrise', label: 'Sunrise', value: panchang.sunrise ? formatClock(panchang.sunrise) : '—' },
    { id: 'sunset', label: 'Sunset', value: panchang.sunset ? formatClock(panchang.sunset) : '—' },
    {
      id: 'tithi',
      label: 'Tithi',
      value: `${panchang.tithi.paksha} ${panchang.tithi.name}`,
    },
    { id: 'nakshatra', label: 'Nakshatra', value: panchang.nakshatra.meta.name },
  ];

  return (
    <View style={styles.section}>
      <SectionHeader title="Today’s Panchang" actionLabel="Full panchang" onAction={onSeeAll} />

      <View style={styles.card}>
        <Text style={styles.place}>
          {panchang.place.name} · {dateLabel}
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

        <Text style={styles.ends}>
          This tithi runs until {formatClock(panchang.tithi.endsAt)}
        </Text>
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
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  place: {
    ...type.label,
    color: colors.muted,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: space.md,
  },
  cell: {
    width: '50%',
    paddingVertical: space.sm,
  },
  label: {
    ...type.caption,
    color: colors.muted,
  },
  value: {
    ...type.section,
    color: colors.ink,
  },
  ends: {
    ...type.small,
    color: colors.saffronDeep,
    marginTop: space.sm,
  },
});
