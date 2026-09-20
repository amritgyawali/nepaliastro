import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { trustStats } from '@/data/content';
import { Star } from '@/icons';
import { colors, fontFamily, radius, weight } from '@/theme';

/** The reassurance row that closes the home feed. */
export function TrustStrip() {
  return (
    <View style={styles.card}>
      {trustStats.map((stat, index) => (
        <React.Fragment key={stat.id}>
          {index > 0 ? <View style={styles.divider} /> : null}
          <View style={styles.cell}>
            <View style={styles.valueRow}>
              <Text style={styles.value}>{stat.value}</Text>
              {'star' in stat && stat.star ? (
                <Star size={13} color="#C79A32" filled />
              ) : null}
            </View>
            <Text style={styles.label} numberOfLines={1}>
              {stat.label}
            </Text>
          </View>
        </React.Fragment>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 14,
    marginTop: 20,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.sheet,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  divider: {
    width: 1,
    alignSelf: 'stretch',
    marginVertical: 2,
    backgroundColor: colors.divider,
  },
  cell: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  value: {
    fontFamily,
    fontSize: 17,
    lineHeight: 22,
    fontWeight: weight.bold,
    letterSpacing: -0.3,
    color: colors.inkStrong,
  },
  label: {
    fontFamily,
    fontSize: 11.5,
    color: colors.muted,
    marginTop: 2,
  },
});
