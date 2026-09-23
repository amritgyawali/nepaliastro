import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { formatMoney } from '@/config/format';
import type { Astrologer } from '@/data/astrologers';
import { GUTTER, colors, radius, space, type } from '@/theme';

import { Avatar } from '../Avatar';
import { SectionHeader } from '../SectionHeader';
import { Tappable } from '../Tappable';

const CARD_WIDTH = 160;

type Mode = 'chat' | 'call';

type AstrologerRailProps = {
  title: string;
  data: Astrologer[];
  /** Decides the wording of the action on each card. */
  mode?: Mode;
  onViewAll?: () => void;
  onSelect?: (astrologer: Astrologer) => void;
  onAction?: (astrologer: Astrologer) => void;
};

/**
 * A titled, horizontally scrolling row of astrologers.
 *
 * Each card carries the four things the choice turns on — who they are, what
 * they practise, whether they are free now and what they cost — and nothing
 * else.
 */
export function AstrologerRail({
  title,
  data,
  mode = 'chat',
  onViewAll,
  onSelect,
  onAction,
}: AstrologerRailProps) {
  if (data.length === 0) return null;

  return (
    <View style={styles.section}>
      <SectionHeader title={title} onAction={onViewAll} />

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.rail}
      >
        {data.map((astrologer) => (
          <RailCard
            key={astrologer.id}
            astrologer={astrologer}
            mode={mode}
            onSelect={() => onSelect?.(astrologer)}
            onAction={() => onAction?.(astrologer)}
          />
        ))}
      </ScrollView>
    </View>
  );
}

type CardProps = {
  astrologer: Astrologer;
  mode: Mode;
  onSelect: () => void;
  onAction: () => void;
};

/**
 * The card body and its action are siblings rather than nested pressables:
 * on web, one inside the other renders a <button> inside a <button>.
 */
function RailCard({ astrologer, mode, onSelect, onAction }: CardProps) {
  const actionLabel = mode === 'call' ? 'Call' : 'Chat';
  const rate = astrologer.discountedRate ?? astrologer.rate;

  return (
    <View style={styles.card}>
      <Tappable
        accessibilityRole="button"
        accessibilityLabel={`${astrologer.name}, ${astrologer.skills}, ${formatMoney(rate)} per minute`}
        onPress={onSelect}
        feel="card"
        style={styles.cardBody}
        pressedStyle={styles.pressed}
      >
        <Avatar uri={astrologer.photo} name={astrologer.name} size={64} />

        <Text style={styles.name} numberOfLines={1}>
          {astrologer.name}
        </Text>
        <Text style={styles.skills} numberOfLines={1}>
          {astrologer.skills}
        </Text>

        <Text
          style={[styles.meta, !astrologer.online && styles.metaBusy]}
          numberOfLines={1}
        >
          {astrologer.online ? 'Online now' : astrologer.waitTime ?? 'Busy'}
        </Text>
        <Text style={styles.price} numberOfLines={1}>
          {formatMoney(rate, undefined, { perMinute: true })}
        </Text>
      </Tappable>

      <Tappable
        accessibilityRole="button"
        accessibilityLabel={`${actionLabel} with ${astrologer.name}`}
        onPress={onAction}
        style={styles.action}
        hoveredStyle={styles.actionPressed}
        pressedStyle={styles.actionPressed}
      >
        <Text style={styles.actionLabel}>{actionLabel}</Text>
      </Tappable>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginTop: space.xl,
  },
  rail: {
    paddingHorizontal: GUTTER,
    gap: space.md,
  },
  card: {
    width: CARD_WIDTH,
    padding: space.md,
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardBody: {
    alignItems: 'center',
    alignSelf: 'stretch',
  },
  pressed: {
    opacity: 0.75,
  },
  name: {
    ...type.label,
    color: colors.ink,
    marginTop: space.sm,
    maxWidth: '100%',
  },
  skills: {
    ...type.caption,
    color: colors.muted,
    textAlign: 'center',
    maxWidth: '100%',
  },
  meta: {
    ...type.caption,
    color: colors.green,
    marginTop: space.sm,
  },
  metaBusy: {
    color: colors.muted,
  },
  price: {
    ...type.caption,
    color: colors.body,
  },
  action: {
    alignSelf: 'stretch',
    marginTop: space.md,
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
});
