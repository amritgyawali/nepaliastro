import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { Astrologer } from '@/data/astrologers';
import { colors, fontFamily, radius, shadow, weight } from '@/theme';

import { Avatar } from './Avatar';
import { CelebrityRibbon, Stars, VerifiedBadge } from './Badges';

type Mode = 'chat' | 'call';

type AstrologerCardProps = {
  astrologer: Astrologer;
  mode: Mode;
  onPress?: () => void;
  onAction?: () => void;
};

/**
 * Full-width directory card: portrait and rating on the left, details in the
 * middle, and a Chat (green) or Call (red) action on the right.
 */
export function AstrologerCard({ astrologer, mode, onPress, onAction }: AstrologerCardProps) {
  const isCall = mode === 'call';
  const accent = isCall ? colors.red : colors.green;
  const actionLabel = isCall ? 'Call' : 'Chat';
  const hasDiscount = typeof astrologer.discountedRate === 'number';
  const full = !astrologer.preview;

  return (
    // The card is a plain View so the action button is a sibling of the
    // tappable body rather than a child — nesting two pressables would emit
    // nested <button> elements on web.
    <View style={styles.card}>
      {astrologer.celebrity ? <CelebrityRibbon /> : null}

      <View style={styles.row}>
        <Pressable
          onPress={onPress}
          accessibilityRole="button"
          accessibilityLabel={`${astrologer.name}, ${astrologer.skills}`}
          style={({ pressed }) => [styles.body, pressed && styles.cardPressed]}
        >
          <View style={styles.left}>
            <Avatar uri={astrologer.photo} name={astrologer.name} size={84} ring />
            {astrologer.rating ? (
              <View style={styles.ratingBlock}>
                <Stars count={astrologer.rating} />
                {astrologer.orders ? (
                  <Text style={styles.orders}>{astrologer.orders}</Text>
                ) : null}
              </View>
            ) : null}
          </View>

          <View style={styles.middle}>
            <View style={styles.nameRow}>
              <Text style={styles.name} numberOfLines={1}>
                {astrologer.name}
              </Text>
              {astrologer.verified ? <VerifiedBadge /> : null}
            </View>

            <Text style={styles.meta} numberOfLines={1}>
              {astrologer.skills}
            </Text>
            <Text style={styles.meta} numberOfLines={1}>
              {astrologer.languages}
            </Text>
            {astrologer.experience ? (
              <Text style={styles.experience}>Exp: {astrologer.experience} Years</Text>
            ) : null}

            {full ? (
              <View style={styles.priceRow}>
                {hasDiscount ? (
                  <>
                    <Text style={styles.priceStruck}>USD {astrologer.rate.toFixed(2)}</Text>
                    <Text style={[styles.price, { color: colors.red }]}>
                      {astrologer.discountedRate?.toFixed(2)}
                      <Text style={[styles.priceUnit, { color: colors.red }]}>/min</Text>
                    </Text>
                  </>
                ) : (
                  <Text style={styles.price}>
                    USD {astrologer.rate.toFixed(2)}
                    <Text style={styles.priceUnit}>/min</Text>
                  </Text>
                )}
              </View>
            ) : null}
          </View>
        </Pressable>

        {full ? (
          <View style={styles.actionColumn}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`${actionLabel} with ${astrologer.name}`}
              onPress={onAction}
              style={({ pressed }) => [
                styles.actionButton,
                { borderColor: accent },
                pressed && styles.actionPressed,
              ]}
            >
              <Text
                style={[styles.actionLabel, { color: isCall ? colors.red : colors.greenText }]}
              >
                {actionLabel}
              </Text>
            </Pressable>
            {astrologer.waitTime ? (
              <Text style={styles.waitTime}>{astrologer.waitTime}</Text>
            ) : null}
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    paddingVertical: 14,
    paddingHorizontal: 12,
    overflow: 'hidden',
    ...shadow(2, 0.04, 8),
  },
  cardPressed: {
    opacity: 0.95,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  /** Tappable region: portrait, rating and details, but not the CTA. */
  body: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  left: {
    alignItems: 'center',
    marginRight: 12,
  },
  ratingBlock: {
    alignItems: 'center',
    marginTop: 8,
  },
  orders: {
    fontFamily,
    fontSize: 11,
    color: colors.muted,
    marginTop: 3,
  },
  middle: {
    flex: 1,
    paddingRight: 4,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  name: {
    fontFamily,
    fontSize: 19,
    fontWeight: weight.bold,
    letterSpacing: -0.4,
    color: '#1E1E24',
    flexShrink: 1,
  },
  meta: {
    fontFamily,
    fontSize: 13,
    lineHeight: 18,
    color: colors.muted,
    marginTop: 3,
  },
  experience: {
    fontFamily,
    fontSize: 13,
    lineHeight: 18,
    color: colors.muted,
    marginTop: 6,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 8,
    gap: 5,
  },
  price: {
    fontFamily,
    fontSize: 15,
    fontWeight: weight.bold,
    color: colors.inkStrong,
  },
  priceStruck: {
    fontFamily,
    fontSize: 13,
    fontWeight: weight.medium,
    color: colors.subtle,
    textDecorationLine: 'line-through',
  },
  priceUnit: {
    fontFamily,
    fontSize: 13,
    fontWeight: weight.regular,
    color: colors.muted,
  },
  actionColumn: {
    alignSelf: 'center',
    alignItems: 'center',
  },
  actionButton: {
    minWidth: 82,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
  },
  actionPressed: {
    opacity: 0.6,
    transform: [{ scale: 0.97 }],
  },
  actionLabel: {
    fontFamily,
    fontSize: 15,
    fontWeight: weight.medium,
  },
  waitTime: {
    fontFamily,
    fontSize: 11.5,
    color: colors.red,
    marginTop: 4,
  },
});
