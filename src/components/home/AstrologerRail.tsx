import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import type { Astrologer } from '@/data/astrologers';
import { ChevronRight, Clock, SealCheck, Star } from '@/icons';
import { colors, fontFamily, radius, shadow, weight } from '@/theme';

import { Avatar } from '../Avatar';
import { CelebrityRibbon } from '../Badges';
import { PressableScale } from '../PressableScale';
import { SectionHeader } from '../SectionHeader';

const CARD_WIDTH = 172;
const CARD_GAP = 12;

type Mode = 'chat' | 'call';

type AstrologerRailProps = {
  title: string;
  subtitle?: string;
  data: Astrologer[];
  /** Decides the colour and wording of the action on each card. */
  mode?: Mode;
  onViewAll?: () => void;
  onSelect?: (astrologer: Astrologer) => void;
  onAction?: (astrologer: Astrologer) => void;
};

/**
 * A titled, horizontally scrolling rail of astrologer cards.
 *
 * The rail snaps a card at a time so a flick never leaves a portrait cut in
 * half, and every card carries the three things the choice actually turns
 * on: whether they are free now, what they cost, and what they practise.
 */
export function AstrologerRail({
  title,
  subtitle,
  data,
  mode = 'chat',
  onViewAll,
  onSelect,
  onAction,
}: AstrologerRailProps) {
  if (data.length === 0) return null;

  return (
    <View style={styles.section}>
      <SectionHeader title={title} subtitle={subtitle} onAction={onViewAll} />

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.rail}
        snapToInterval={CARD_WIDTH + CARD_GAP}
        snapToAlignment="start"
        decelerationRate="fast"
      >
        {data.map((astrologer) => (
          <AstrologerRailCard
            key={astrologer.id}
            astrologer={astrologer}
            mode={mode}
            onSelect={() => onSelect?.(astrologer)}
            onAction={() => onAction?.(astrologer)}
          />
        ))}

        {onViewAll ? (
          <PressableScale
            accessibilityRole="button"
            accessibilityLabel={`View all, ${title}`}
            onPress={onViewAll}
            scaleTo={0.94}
            containerStyle={styles.viewAllContainer}
            style={styles.viewAllCard}
          >
            <View style={styles.viewAllCircle}>
              <ChevronRight size={20} color="#3F4348" strokeWidth={2.2} />
            </View>
            <Text style={styles.viewAllLabel}>View all</Text>
          </PressableScale>
        ) : null}
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
 * The card is a plain View: its body and its action are siblings rather than
 * nested pressables, which on web would render a <button> inside a <button>.
 */
function AstrologerRailCard({ astrologer, mode, onSelect, onAction }: CardProps) {
  const isCall = mode === 'call';
  const actionLabel = isCall ? 'Call' : 'Chat';
  const hasDiscount = typeof astrologer.discountedRate === 'number';

  const meta = [
    astrologer.experience ? `${astrologer.experience} yrs` : null,
    astrologer.languages.split(',')[0]?.trim() || null,
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <View style={styles.card}>
      {astrologer.celebrity ? <CelebrityRibbon /> : null}

      <View style={styles.statusSlot} pointerEvents="none">
        {astrologer.online ? (
          <View style={[styles.statusPill, styles.statusOnline]}>
            <View style={styles.onlineDot} />
            <Text style={styles.statusOnlineLabel}>Online</Text>
          </View>
        ) : astrologer.waitTime ? (
          <View style={styles.statusPill}>
            <Clock size={11} color={colors.muted} strokeWidth={2} />
            <Text style={styles.statusLabel}>
              {astrologer.waitTime.replace('wait ~ ', '')}
            </Text>
          </View>
        ) : null}
      </View>

      <PressableScale
        accessibilityRole="button"
        accessibilityLabel={`${astrologer.name}, ${astrologer.skills}, USD ${
          astrologer.discountedRate ?? astrologer.rate
        } per minute`}
        onPress={onSelect}
        scaleTo={0.97}
        containerStyle={styles.cardBodyContainer}
        style={styles.cardBody}
      >
        <Avatar uri={astrologer.photo} name={astrologer.name} size={72} ring />

        <View style={styles.nameRow}>
          <Text style={styles.name} numberOfLines={1}>
            {astrologer.name}
          </Text>
          {astrologer.verified ? <SealCheck size={13} color={colors.green} /> : null}
        </View>

        <Text style={styles.skills} numberOfLines={1}>
          {astrologer.skills}
        </Text>

        <View style={styles.metaRow}>
          {astrologer.rating ? (
            <>
              <Star size={11} color="#C79A32" filled />
              <Text style={styles.metaStrong}>{astrologer.rating.toFixed(1)}</Text>
            </>
          ) : null}
          {meta ? (
            <Text style={styles.meta} numberOfLines={1}>
              {astrologer.rating ? `· ${meta}` : meta}
            </Text>
          ) : null}
        </View>

        <View style={styles.priceRow}>
          {hasDiscount ? (
            <Text style={styles.struck}>USD {astrologer.rate}</Text>
          ) : null}
          <Text style={styles.price}>
            USD {astrologer.discountedRate ?? astrologer.rate}/min
          </Text>
        </View>
      </PressableScale>

      <PressableScale
        accessibilityRole="button"
        accessibilityLabel={`${actionLabel} with ${astrologer.name}`}
        onPress={onAction}
        scaleTo={0.96}
        containerStyle={styles.actionContainer}
        style={[styles.actionButton, isCall ? styles.actionCall : styles.actionChat]}
      >
        <Text style={[styles.actionLabel, isCall && styles.actionLabelCall]}>
          {actionLabel}
        </Text>
      </PressableScale>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginTop: 18,
  },
  rail: {
    paddingHorizontal: 14,
    gap: CARD_GAP,
    paddingBottom: 4,
  },
  card: {
    width: CARD_WIDTH,
    paddingVertical: 14,
    paddingHorizontal: 10,
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: '#EDEDEA',
    overflow: 'hidden',
    ...shadow(2, 0.04, 8),
  },
  statusSlot: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: radius.pill,
    backgroundColor: colors.sheet,
  },
  statusOnline: {
    backgroundColor: colors.greenSoft,
  },
  onlineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.green,
  },
  statusOnlineLabel: {
    fontFamily,
    fontSize: 10.5,
    fontWeight: weight.semibold,
    color: colors.greenSoftText,
  },
  statusLabel: {
    fontFamily,
    fontSize: 10.5,
    fontWeight: weight.medium,
    color: colors.muted,
  },
  cardBodyContainer: {
    alignSelf: 'stretch',
  },
  cardBody: {
    alignItems: 'center',
    marginTop: 6,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 10,
    maxWidth: '100%',
  },
  name: {
    fontFamily,
    fontSize: 15,
    fontWeight: weight.semibold,
    color: colors.inkStrong,
    letterSpacing: -0.2,
    flexShrink: 1,
  },
  skills: {
    fontFamily,
    fontSize: 11.5,
    lineHeight: 15,
    color: colors.muted,
    marginTop: 3,
    textAlign: 'center',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 5,
    maxWidth: '100%',
  },
  metaStrong: {
    fontFamily,
    fontSize: 11.5,
    fontWeight: weight.semibold,
    color: '#4B4F55',
  },
  meta: {
    fontFamily,
    fontSize: 11.5,
    color: colors.muted,
    flexShrink: 1,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 5,
    marginTop: 7,
  },
  struck: {
    fontFamily,
    fontSize: 11.5,
    color: colors.subtle,
    textDecorationLine: 'line-through',
  },
  price: {
    fontFamily,
    fontSize: 13,
    fontWeight: weight.medium,
    color: colors.body,
  },
  actionContainer: {
    marginTop: 'auto',
    alignSelf: 'stretch',
    paddingTop: 12,
  },
  actionButton: {
    paddingVertical: 9,
    borderRadius: radius.pill,
    borderWidth: 1,
    alignItems: 'center',
  },
  actionChat: {
    borderColor: '#2D8A5A',
  },
  actionCall: {
    borderColor: colors.red,
  },
  actionLabel: {
    fontFamily,
    fontSize: 14,
    fontWeight: weight.semibold,
    color: colors.greenText,
  },
  actionLabelCall: {
    color: colors.red,
  },
  viewAllContainer: {
    width: 104,
  },
  viewAllCard: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: colors.sheet,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: '#EDEDEA',
  },
  viewAllCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow(1, 0.05, 6),
  },
  viewAllLabel: {
    fontFamily,
    fontSize: 13,
    fontWeight: weight.medium,
    color: '#4B4F55',
  },
});
