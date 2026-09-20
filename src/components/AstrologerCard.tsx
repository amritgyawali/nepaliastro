import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { Astrologer } from '@/data/astrologers';
import { Star } from '@/icons';
import { colors, radius, space, type } from '@/theme';

import { Avatar } from './Avatar';
import { VerifiedBadge } from './Badges';

type Mode = 'chat' | 'call';

type AstrologerCardProps = {
  astrologer: Astrologer;
  mode: Mode;
  onPress?: () => void;
  onAction?: () => void;
};

/**
 * One row of a directory: portrait, who they are, what they cost, and the
 * single action that starts a consultation.
 */
export function AstrologerCard({ astrologer, mode, onPress, onAction }: AstrologerCardProps) {
  const actionLabel = mode === 'call' ? 'Call' : 'Chat';
  const rate = astrologer.discountedRate ?? astrologer.rate;
  const hasDiscount = typeof astrologer.discountedRate === 'number';

  const facts = [
    astrologer.experience ? `${astrologer.experience} yrs experience` : null,
    astrologer.languages,
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    // A plain View, so the action is a sibling of the tappable body rather
    // than a child — nesting pressables emits nested <button>s on web.
    <View style={styles.card}>
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={`${astrologer.name}, ${astrologer.skills}`}
        style={({ pressed }) => [styles.body, pressed && styles.pressed]}
      >
        <Avatar uri={astrologer.photo} name={astrologer.name} size={60} />

        <View style={styles.details}>
          <View style={styles.nameRow}>
            <Text style={styles.name} numberOfLines={1}>
              {astrologer.name}
            </Text>
            {astrologer.verified ? <VerifiedBadge size={15} /> : null}
          </View>

          <Text style={styles.skills} numberOfLines={1}>
            {astrologer.skills}
          </Text>
          <Text style={styles.facts} numberOfLines={1}>
            {facts}
          </Text>

          {astrologer.rating ? (
            <View style={styles.ratingRow}>
              <Star size={13} color={colors.saffron} filled />
              <Text style={styles.rating}>{astrologer.rating.toFixed(1)}</Text>
              {astrologer.orders ? (
                <Text style={styles.orders} numberOfLines={1}>
                  · {astrologer.orders}
                </Text>
              ) : null}
            </View>
          ) : null}
        </View>
      </Pressable>

      <View style={styles.side}>
        <Text style={styles.price}>USD {rate.toFixed(2)}/min</Text>
        {hasDiscount ? (
          <Text style={styles.struck}>USD {astrologer.rate.toFixed(2)}</Text>
        ) : null}

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${actionLabel} with ${astrologer.name}`}
          onPress={onAction}
          style={({ pressed }) => [styles.action, pressed && styles.actionPressed]}
        >
          <Text style={styles.actionLabel}>{actionLabel}</Text>
        </Pressable>

        <Text style={[styles.status, astrologer.online && styles.statusOnline]}>
          {astrologer.online ? 'Online' : astrologer.waitTime ?? 'Busy'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: space.md,
  },
  body: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
  },
  pressed: {
    opacity: 0.6,
  },
  details: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.xs + 2,
  },
  name: {
    ...type.section,
    color: colors.ink,
    flexShrink: 1,
  },
  skills: {
    ...type.small,
    color: colors.body,
  },
  facts: {
    ...type.caption,
    color: colors.muted,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.xs,
    marginTop: space.xs,
  },
  rating: {
    ...type.caption,
    color: colors.ink,
  },
  orders: {
    ...type.caption,
    color: colors.muted,
    flexShrink: 1,
  },
  side: {
    alignItems: 'flex-end',
    gap: 2,
  },
  price: {
    ...type.caption,
    color: colors.ink,
  },
  struck: {
    ...type.caption,
    color: colors.subtle,
    textDecorationLine: 'line-through',
  },
  action: {
    minWidth: 88,
    marginTop: space.xs,
    paddingHorizontal: space.lg,
    paddingVertical: space.sm + 2,
    borderRadius: radius.sm,
    backgroundColor: colors.saffron,
    alignItems: 'center',
  },
  actionPressed: {
    backgroundColor: colors.saffronPressed,
  },
  actionLabel: {
    ...type.label,
    color: colors.onSaffron,
  },
  status: {
    ...type.caption,
    color: colors.muted,
  },
  statusOnline: {
    color: colors.green,
  },
});
