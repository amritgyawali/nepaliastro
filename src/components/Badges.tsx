import React from 'react';
import { StyleSheet, View } from 'react-native';

import { SealCheck, Star } from '@/icons';
import { colors } from '@/theme';

/** Row of five stars, filled up to `count`. */
export function Stars({ count = 5, size = 13 }: { count?: number; size?: number }) {
  return (
    <View style={styles.stars}>
      {Array.from({ length: 5 }, (_, i) => (
        <Star key={i} size={size} filled={i < count} color={colors.saffron} />
      ))}
    </View>
  );
}

/** Shown next to an astrologer whose identity the platform has checked. */
export function VerifiedBadge({ size = 16 }: { size?: number }) {
  return <SealCheck size={size} color={colors.green} />;
}

const styles = StyleSheet.create({
  stars: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
});
