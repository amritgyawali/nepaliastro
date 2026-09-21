import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors, space, type } from '@/theme';

type DataRowProps = {
  label: string;
  value: string;
  /** The line under the pair that says what the figure is for. */
  note?: string;
  /** Adds the rule above. Pass false for the first row of a group. */
  divided?: boolean;
  /** Colours the value — for a verdict rather than a measurement. */
  tone?: 'default' | 'good' | 'bad';
};

/** Label on the left, value on the right, an optional explanation beneath. */
export function DataRow({ label, value, note, divided = true, tone = 'default' }: DataRowProps) {
  return (
    <View style={[styles.row, divided && styles.divided]}>
      <View style={styles.head}>
        <Text style={styles.label}>{label}</Text>
        <Text
          style={[
            styles.value,
            tone === 'good' && styles.good,
            tone === 'bad' && styles.bad,
          ]}
        >
          {value}
        </Text>
      </View>
      {note ? <Text style={styles.note}>{note}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    paddingVertical: space.md,
  },
  divided: {
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  head: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: space.md,
  },
  label: {
    ...type.label,
    color: colors.muted,
    flexShrink: 1,
  },
  value: {
    ...type.section,
    color: colors.ink,
    flexShrink: 1,
    textAlign: 'right',
  },
  good: { color: colors.green },
  bad: { color: colors.red },
  note: {
    ...type.small,
    color: colors.muted,
    marginTop: 2,
  },
});
