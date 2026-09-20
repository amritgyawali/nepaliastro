import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Moon, Star, Sunrise, Sunset } from '@/icons';
import type { Panchang } from '@/lib/panchang';
import { colors, fontFamily, radius, weight } from '@/theme';

import { SectionHeader } from '../SectionHeader';

type TodayPanchangProps = {
  panchang: Panchang;
  /** "Sun 20 Sep" — the day these figures belong to. */
  dateLabel: string;
};

/** The four figures a reader checks before planning the day. */
export function TodayPanchang({ panchang, dateLabel }: TodayPanchangProps) {
  const cells = [
    { id: 'sunrise', Icon: Sunrise, label: 'Sunrise', value: panchang.sun.sunrise },
    { id: 'sunset', Icon: Sunset, label: 'Sunset', value: panchang.sun.sunset },
    {
      id: 'tithi',
      Icon: Moon,
      label: 'Tithi',
      value: `${panchang.tithi.paksha} ${panchang.tithi.name}`,
    },
    {
      id: 'nakshatra',
      Icon: Star,
      label: 'Nakshatra',
      value: panchang.nakshatra.name,
    },
  ];

  return (
    <View style={styles.section}>
      <SectionHeader
        title="Today’s Panchang"
        subtitle={`${panchang.place} · ${dateLabel}`}
      />

      <View style={styles.card}>
        {cells.map((cell) => (
          <View key={cell.id} style={styles.cell}>
            <View style={styles.cellHead}>
              <cell.Icon size={14} color="#8A7233" strokeWidth={1.8} />
              <Text style={styles.label}>{cell.label}</Text>
            </View>
            <Text style={styles.value} numberOfLines={1}>
              {cell.value}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginTop: 20,
  },
  card: {
    marginHorizontal: 14,
    padding: 14,
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: colors.cream,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.bannerBorder,
  },
  cell: {
    width: '50%',
    paddingVertical: 7,
    paddingRight: 8,
  },
  cellHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  label: {
    fontFamily,
    fontSize: 11.5,
    fontWeight: weight.medium,
    letterSpacing: 0.2,
    color: '#8A7969',
  },
  value: {
    fontFamily,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: weight.semibold,
    letterSpacing: -0.2,
    color: colors.remedyStatValue,
    marginTop: 3,
  },
});
