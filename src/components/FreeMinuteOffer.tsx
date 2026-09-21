import React from 'react';
import { Modal, StyleSheet, Text, View } from 'react-native';

import { topNearbyAstrologer } from '@/data/astrologers';
import { colors, radius, space, type } from '@/theme';

import { Avatar } from './Avatar';
import { PrimaryButton } from './PrimaryButton';
import { Tappable } from './Tappable';

type FreeMinuteOfferProps = {
  visible: boolean;
  /** Claims the offer — the caller opens the live chat. */
  onClaim: () => void;
  /** Declines it — the caller sends the user to the home screen. */
  onCancel: () => void;
};

/**
 * "Your first minute is free", offered once onboarding has the birth date and
 * time — the point at which a reading is actually possible.
 */
export function FreeMinuteOffer({ visible, onClaim, onCancel }: FreeMinuteOfferProps) {
  const astrologer = topNearbyAstrologer;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.title}>Your first minute is free</Text>
          <Text style={styles.body}>
            Your birth details are saved. Start with the highest-rated astrologer near
            you — you are not charged until the minute is up.
          </Text>

          <View style={styles.astrologer}>
            <Avatar uri={astrologer.photo} name={astrologer.name} size={48} />
            <View style={styles.astrologerText}>
              <Text style={styles.name} numberOfLines={1}>
                {astrologer.name}
              </Text>
              <Text style={styles.meta} numberOfLines={1}>
                {astrologer.skills} · {astrologer.city}
              </Text>
              <Text style={styles.meta} numberOfLines={1}>
                USD {astrologer.rate.toFixed(2)}/min after the free minute
              </Text>
            </View>
          </View>

          <PrimaryButton label="Start free chat" onPress={onClaim} style={styles.claim} />

          <Tappable
            accessibilityRole="button"
            accessibilityLabel="Skip the free minute"
            onPress={onCancel}
            style={styles.skip}
            pressedStyle={styles.pressed}
          >
            <Text style={styles.skipLabel}>Maybe later</Text>
          </Tappable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: space.xl,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: space.xl,
  },
  title: {
    ...type.title,
    color: colors.ink,
  },
  body: {
    ...type.body,
    color: colors.muted,
    marginTop: space.sm,
  },
  astrologer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    marginTop: space.lg,
    padding: space.md,
    borderRadius: radius.md,
    backgroundColor: colors.saffronSoft,
    borderWidth: 1,
    borderColor: colors.saffronBorder,
  },
  astrologerText: {
    flex: 1,
  },
  name: {
    ...type.label,
    color: colors.ink,
  },
  meta: {
    ...type.caption,
    color: colors.muted,
  },
  claim: {
    marginTop: space.lg,
  },
  skip: {
    alignSelf: 'center',
    paddingVertical: space.md,
    paddingHorizontal: space.lg,
    marginTop: space.xs,
  },
  pressed: {
    opacity: 0.5,
  },
  skipLabel: {
    ...type.label,
    color: colors.muted,
  },
});
