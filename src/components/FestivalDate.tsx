import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { GREGORIAN_MONTHS_SHORT, nepaliClock, startOfNepaliDay } from '@/lib/jyotish';
import { colors, radius, space, type } from '@/theme';

const DAY_MS = 86_400_000;

/**
 * "Today", "Tomorrow", "In 16 days" — how far off a festival is, counted in
 * Nepal days so it turns over at Kathmandu midnight, not the phone's.
 */
export function untilLabel(date: Date, now: Date): string {
  const days = Math.round(
    (startOfNepaliDay(date).getTime() - startOfNepaliDay(now).getTime()) / DAY_MS,
  );
  if (days === 0) return 'Today';
  if (days === 1) return 'Tomorrow';
  if (days > 1) return `In ${days} days`;
  if (days === -1) return 'Yesterday';
  return `${-days} days ago`;
}

/**
 * The day and month in a small block, the way a wall patro prints a date:
 * the number first and large, the month under it.
 */
export function DateLeaf({ date, past }: { date: Date; past?: boolean }) {
  const { day, month } = nepaliClock(date);
  return (
    <View style={[styles.leaf, past && styles.leafPast]}>
      <Text style={[styles.day, past && styles.textPast]} allowFontScaling={false}>
        {day}
      </Text>
      <Text style={[styles.month, past && styles.textPast]} allowFontScaling={false}>
        {GREGORIAN_MONTHS_SHORT[month - 1]}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  leaf: {
    width: 48,
    paddingVertical: space.xs,
    alignItems: 'center',
    borderRadius: radius.md,
    backgroundColor: colors.saffronSoft,
    borderWidth: 1,
    borderColor: colors.saffronBorder,
  },
  leafPast: {
    backgroundColor: colors.fill,
    borderColor: colors.border,
  },
  day: {
    ...type.title,
    color: colors.saffronDeep,
  },
  month: {
    ...type.caption,
    color: colors.saffronDeep,
  },
  textPast: {
    color: colors.subtle,
  },
});
