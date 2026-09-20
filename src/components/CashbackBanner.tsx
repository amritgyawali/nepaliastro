import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, fontFamily, radius, shadow, weight } from '@/theme';

/** Decorative rupee coins scattered behind the banner copy. */
const COINS = [
  { size: 62, top: 46, left: -24, opacity: 0.85, rotate: '-12deg', fontSize: 24 },
  { size: 52, bottom: -14, left: -18, opacity: 0.7, rotate: '18deg', fontSize: 20 },
  { size: 58, top: 4, right: -22, opacity: 0.85, rotate: '20deg', fontSize: 22 },
  { size: 44, bottom: 22, right: -16, opacity: 0.62, rotate: '-8deg', fontSize: 17 },
] as const;

/** "100% Cashback!" promo at the top of both astrologer directories. */
export function CashbackBanner({ onRecharge }: { onRecharge?: () => void }) {
  return (
    <LinearGradient
      colors={[colors.bannerTop, '#FFFDF5', colors.bannerBottom]}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={styles.root}
    >
      {COINS.map((coin, i) => (
        <View
          key={i}
          pointerEvents="none"
          style={[
            styles.coin,
            {
              width: coin.size,
              height: coin.size,
              borderRadius: coin.size / 2,
              opacity: coin.opacity,
              transform: [{ rotate: coin.rotate }],
              top: 'top' in coin ? coin.top : undefined,
              bottom: 'bottom' in coin ? coin.bottom : undefined,
              left: 'left' in coin ? coin.left : undefined,
              right: 'right' in coin ? coin.right : undefined,
            },
          ]}
        >
          <Text style={[styles.coinGlyph, { fontSize: coin.fontSize }]}>₹</Text>
        </View>
      ))}

      <Text style={styles.headline}>100% Cashback!</Text>

      <View style={styles.subtitleRow}>
        <View style={styles.rule} />
        <Text style={styles.subtitle}>ON ALL RECHARGES</Text>
        <View style={styles.rule} />
      </View>

      <Pressable
        accessibilityRole="button"
        onPress={onRecharge}
        style={({ pressed }) => [styles.cta, pressed && styles.ctaPressed]}
      >
        <Text style={styles.ctaLabel}>RECHARGE NOW</Text>
      </Pressable>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: {
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.bannerBorder,
    paddingVertical: 20,
    paddingHorizontal: 18,
    alignItems: 'center',
    overflow: 'hidden',
    ...shadow(1, 0.04),
  },
  coin: {
    position: 'absolute',
    backgroundColor: colors.coin,
    alignItems: 'center',
    justifyContent: 'center',
  },
  coinGlyph: {
    fontFamily,
    fontWeight: weight.bold,
    color: colors.coinDeep,
  },
  headline: {
    fontFamily,
    fontSize: 32,
    lineHeight: 38,
    fontWeight: weight.heavy,
    letterSpacing: -0.9,
    color: '#3D3226',
  },
  subtitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
    marginBottom: 14,
  },
  rule: {
    width: 34,
    height: 1,
    backgroundColor: '#D8D2BE',
  },
  subtitle: {
    fontFamily,
    fontSize: 12.5,
    fontWeight: weight.medium,
    letterSpacing: 0.6,
    color: '#6B6355',
  },
  cta: {
    paddingHorizontal: 26,
    paddingVertical: 11,
    borderRadius: radius.pill,
    backgroundColor: '#EFD73A',
  },
  ctaPressed: {
    backgroundColor: colors.yellowPressed,
    transform: [{ scale: 0.97 }],
  },
  ctaLabel: {
    fontFamily,
    fontSize: 13.5,
    fontWeight: weight.bold,
    letterSpacing: 0.8,
    color: '#332C1C',
  },
});
