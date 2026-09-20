import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ongoingSession } from '@/data/astrologers';
import { colors, fontFamily, radius, shadow, weight } from '@/theme';

import { Avatar } from './Avatar';

/**
 * The live-consultation banner docked just above the tab bar on both
 * directories: portrait with an online dot, rate, status, and a Chat CTA that
 * resumes the conversation.
 */
export function SessionPill({ onResume }: { onResume?: () => void }) {
  return (
    <View style={styles.root}>
      <View style={styles.left}>
        <View>
          <Avatar
            uri={ongoingSession.photo}
            name={ongoingSession.name}
            size={48}
            ring
            ringWidth={1}
          />
          <View style={styles.onlineDot} />
        </View>

        <View style={styles.text}>
          <Text style={styles.name}>{ongoingSession.name}</Text>
          <Text style={styles.rate}>
            USD {ongoingSession.rate} /min{' '}
            <Text style={styles.mode}>({ongoingSession.mode})</Text>
          </Text>
          <Text style={styles.status}>{ongoingSession.status}</Text>
        </View>
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Resume chat with ${ongoingSession.name}`}
        onPress={onResume}
        style={({ pressed }) => [styles.cta, pressed && styles.ctaPressed]}
      >
        <Text style={styles.ctaLabel}>Chat</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.sessionBg,
    borderWidth: 1,
    borderColor: colors.sessionBorder,
    borderRadius: radius.xl,
    paddingVertical: 10,
    paddingHorizontal: 12,
    ...shadow(4, 0.08, 14),
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flexShrink: 1,
  },
  onlineDot: {
    position: 'absolute',
    bottom: 1,
    left: 1,
    width: 13,
    height: 13,
    borderRadius: 7,
    backgroundColor: colors.green,
    borderWidth: 2,
    borderColor: colors.white,
  },
  text: {
    flexShrink: 1,
  },
  name: {
    fontFamily,
    fontSize: 16,
    fontWeight: weight.semibold,
    color: colors.inkStrong,
    letterSpacing: -0.2,
  },
  rate: {
    fontFamily,
    fontSize: 12.5,
    color: '#5C5C5C',
    marginTop: 2,
  },
  mode: {
    color: colors.red,
    fontWeight: weight.medium,
  },
  status: {
    fontFamily,
    fontSize: 12.5,
    color: '#249544',
    marginTop: 2,
  },
  cta: {
    paddingHorizontal: 22,
    paddingVertical: 9,
    borderRadius: radius.pill,
    borderWidth: 2,
    borderColor: colors.blue,
    backgroundColor: colors.white,
  },
  ctaPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.97 }],
  },
  ctaLabel: {
    fontFamily,
    fontSize: 14,
    fontWeight: weight.bold,
    color: colors.blue,
  },
});
