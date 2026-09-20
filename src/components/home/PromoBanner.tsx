import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { photos } from '@/data/images';
import { colors, fontFamily, radius, shadow, weight } from '@/theme';

/**
 * "What will my future be in the next 5 years?" card.
 *
 * The astrologer sits on a yellow quarter-disc that bleeds off the left edge,
 * reproduced here with an oversized circle clipped by the card.
 */
export function PromoBanner({ onChatNow }: { onChatNow?: () => void }) {
  return (
    <View style={styles.card}>
      <View style={styles.left}>
        <View style={styles.arc} pointerEvents="none" />
        <View style={styles.portraitClip}>
          <Image
            source={{ uri: photos.vinayyv }}
            style={styles.portrait}
            resizeMode="cover"
            accessibilityLabel="Astrologer"
          />
        </View>
      </View>

      <View style={styles.right}>
        <Text style={styles.headline}>
          What will my future be in the{' '}
          <Text style={styles.headlineStrong}>next 5 years?</Text>
        </Text>
        <Text style={styles.subtitle}>Ask Astrologer</Text>
        <Pressable
          accessibilityRole="button"
          onPress={onChatNow}
          style={({ pressed }) => [styles.cta, pressed && styles.ctaPressed]}
        >
          <Text style={styles.ctaLabel}>Chat Now</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 14,
    marginTop: 14,
    minHeight: 148,
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: '#EFEFEF',
    overflow: 'hidden',
    ...shadow(3, 0.07, 14),
  },
  left: {
    width: '42%',
    justifyContent: 'flex-end',
    alignItems: 'center',
    overflow: 'hidden',
    backgroundColor: '#F2DE4E',
  },
  /** Soft disc behind the portrait, echoing the arc in the mockup. */
  arc: {
    position: 'absolute',
    left: -28,
    top: -26,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: '#F7E877',
  },
  portraitClip: {
    width: '84%',
    height: '86%',
    alignSelf: 'center',
    marginTop: 'auto',
    borderTopLeftRadius: 60,
    borderTopRightRadius: 60,
    overflow: 'hidden',
  },
  portrait: {
    width: '100%',
    height: '100%',
  },
  right: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 16,
    justifyContent: 'center',
  },
  headline: {
    fontFamily,
    fontSize: 16,
    lineHeight: 21,
    fontWeight: weight.medium,
    color: '#1B1D20',
    letterSpacing: -0.2,
  },
  headlineStrong: {
    fontWeight: weight.bold,
  },
  subtitle: {
    fontFamily,
    fontSize: 13,
    color: '#5C6066',
    marginTop: 6,
  },
  cta: {
    alignSelf: 'flex-start',
    marginTop: 10,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: radius.pill,
    backgroundColor: '#F2DE4E',
  },
  ctaPressed: {
    backgroundColor: colors.yellowPressed,
    transform: [{ scale: 0.97 }],
  },
  ctaLabel: {
    fontFamily,
    fontSize: 13,
    fontWeight: weight.semibold,
    color: '#26262A',
  },
});
