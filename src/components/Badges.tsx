import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { SealCheck, Star } from '@/icons';
import { colors, fontFamily, weight } from '@/theme';

/** Row of five filled stars shown beneath astrologer portraits. */
export function Stars({ count = 5, size = 13 }: { count?: number; size?: number }) {
  return (
    <View style={styles.stars}>
      {Array.from({ length: 5 }, (_, i) => (
        <Star key={i} size={size} filled={i < count} color="#57534E" />
      ))}
    </View>
  );
}

export function VerifiedBadge({ size = 17 }: { size?: number }) {
  return <SealCheck size={size} color={colors.green} />;
}

/**
 * The dark diagonal "*Celebrity*" ribbon pinned to the top-left corner of
 * featured astrologer cards.
 */
export function CelebrityRibbon() {
  return (
    <View style={styles.ribbonClip} pointerEvents="none">
      <View style={styles.ribbon}>
        <Text style={styles.ribbonText} numberOfLines={1}>
          *Celebrity*
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  stars: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  ribbonClip: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 86,
    height: 86,
    overflow: 'hidden',
    borderTopLeftRadius: 18,
  },
  ribbon: {
    position: 'absolute',
    top: 14,
    left: -28,
    width: 120,
    paddingVertical: 3,
    backgroundColor: '#2D2D2D',
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ rotate: '-45deg' }],
  },
  ribbonText: {
    fontFamily,
    fontSize: 9,
    fontWeight: weight.bold,
    letterSpacing: 0.3,
    color: colors.yellowDot,
  },
});
