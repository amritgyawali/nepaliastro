import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { topNearbyAstrologer } from '@/data/astrologers';
import { Gift, MapPin } from '@/icons';
import { colors, fontFamily, radius, shadow, weight } from '@/theme';

import { Avatar } from './Avatar';
import { Stars, VerifiedBadge } from './Badges';

type FreeMinuteOfferProps = {
  visible: boolean;
  /** Claims the offer — the caller sends the user into the live chat. */
  onClaim: () => void;
  /** Declines the offer — the caller sends the user to the home screen. */
  onCancel: () => void;
};

/**
 * "1 minute free chat" offer, raised as soon as onboarding has the user's
 * birth date and time. Claiming opens a live session with the best-rated
 * astrologer near the user; cancelling drops them on the home screen.
 */
export function FreeMinuteOffer({ visible, onClaim, onCancel }: FreeMinuteOfferProps) {
  const astrologer = topNearbyAstrologer;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <Pressable style={styles.backdrop} onPress={onCancel}>
        <Pressable style={styles.card} onPress={(e) => e.stopPropagation()}>
          <View style={styles.giftBadge}>
            <Gift size={24} color="#8A6D12" strokeWidth={1.8} />
          </View>

          <Text style={styles.title}>1 Minute Chat FREE</Text>
          <Text style={styles.subtitle}>
            Your birth chart is ready. Talk to the top astrologer near you — the first
            minute is on us.
          </Text>

          <View style={styles.astroCard}>
            <View style={styles.rankPill}>
              <Text style={styles.rankLabel}>#1 NEAR YOU</Text>
            </View>

            <Avatar
              uri={astrologer.photo}
              name={astrologer.name}
              size={62}
              ring
              ringWidth={1.5}
            />

            <View style={styles.astroText}>
              <View style={styles.nameRow}>
                <Text style={styles.name} numberOfLines={1}>
                  {astrologer.name}
                </Text>
                {astrologer.verified ? <VerifiedBadge size={15} /> : null}
              </View>

              <Text style={styles.skills} numberOfLines={1}>
                {astrologer.skills}
              </Text>

              <View style={styles.metaRow}>
                <Stars count={astrologer.rating ?? 5} size={11} />
                {astrologer.experience ? (
                  <Text style={styles.meta}>{astrologer.experience} yrs exp</Text>
                ) : null}
              </View>

              <View style={styles.placeRow}>
                <MapPin size={12} color="#8A8F86" strokeWidth={2} />
                <Text style={styles.place} numberOfLines={1}>
                  {astrologer.city} • {astrologer.distance}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.rateRow}>
            <Text style={styles.rateStrike}>USD {astrologer.rate.toFixed(2)}/min</Text>
            <Text style={styles.rateFree}>FREE for 1 min</Text>
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Claim one free minute with ${astrologer.name}`}
            onPress={onClaim}
            style={({ pressed }) => [styles.claim, pressed && styles.claimPressed]}
          >
            <Text style={styles.claimLabel}>Claim Offer &amp; Start Chat</Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Cancel the free minute offer"
            onPress={onCancel}
            style={({ pressed }) => [styles.cancel, pressed && styles.pressed]}
          >
            <Text style={styles.cancelLabel}>Cancel</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 22,
  },
  card: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: colors.white,
    borderRadius: 26,
    paddingHorizontal: 20,
    paddingTop: 22,
    paddingBottom: 14,
    alignItems: 'center',
    ...shadow(10, 0.25, 30),
  },
  giftBadge: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.yellowSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  title: {
    fontFamily,
    fontSize: 21,
    fontWeight: weight.bold,
    letterSpacing: -0.4,
    color: colors.inkStrong,
  },
  subtitle: {
    fontFamily,
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
    color: colors.muted,
    marginTop: 6,
  },

  astroCard: {
    alignSelf: 'stretch',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 18,
    padding: 12,
    paddingTop: 18,
    borderRadius: radius.xl,
    backgroundColor: colors.sessionBg,
    borderWidth: 1,
    borderColor: colors.sessionBorder,
  },
  rankPill: {
    position: 'absolute',
    top: -9,
    left: 12,
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: radius.pill,
    backgroundColor: '#2D2D2D',
  },
  rankLabel: {
    fontFamily,
    fontSize: 9,
    fontWeight: weight.bold,
    letterSpacing: 0.5,
    color: colors.yellowDot,
  },
  astroText: {
    flex: 1,
    gap: 3,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  name: {
    fontFamily,
    fontSize: 16,
    fontWeight: weight.semibold,
    letterSpacing: -0.2,
    color: colors.ink,
    flexShrink: 1,
  },
  skills: {
    fontFamily,
    fontSize: 12.5,
    color: '#6B6F68',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  meta: {
    fontFamily,
    fontSize: 11.5,
    fontWeight: weight.medium,
    color: '#6B6F68',
  },
  placeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  place: {
    fontFamily,
    fontSize: 11.5,
    color: '#8A8F86',
    flexShrink: 1,
  },

  rateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 14,
  },
  rateStrike: {
    fontFamily,
    fontSize: 13,
    color: colors.subtle,
    textDecorationLine: 'line-through',
  },
  rateFree: {
    fontFamily,
    fontSize: 13,
    fontWeight: weight.bold,
    color: colors.greenText,
  },

  claim: {
    alignSelf: 'stretch',
    height: 54,
    borderRadius: 14,
    backgroundColor: colors.yellow,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    ...shadow(1, 0.06),
  },
  claimPressed: {
    backgroundColor: colors.yellowPressed,
    transform: [{ scale: 0.99 }],
  },
  claimLabel: {
    fontFamily,
    fontSize: 16.5,
    fontWeight: weight.semibold,
    letterSpacing: 0.2,
    color: '#1E2124',
  },
  cancel: {
    alignSelf: 'stretch',
    paddingVertical: 14,
    alignItems: 'center',
  },
  cancelLabel: {
    fontFamily,
    fontSize: 14.5,
    fontWeight: weight.medium,
    color: colors.muted,
  },
  pressed: {
    opacity: 0.6,
  },
});
