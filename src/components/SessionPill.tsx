import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { ongoingSession } from '@/data/astrologers';
import { colors, radius, space, type } from '@/theme';

import { Avatar } from './Avatar';
import { Tappable } from './Tappable';

/**
 * The consultation already in progress, offered at the top of the directory
 * rather than floating over the list — nothing is covered, and resuming is
 * the first thing you see.
 */
export function SessionPill({ onResume }: { onResume?: () => void }) {
  return (
    <View style={styles.root}>
      <Avatar uri={ongoingSession.photo} name={ongoingSession.name} size={44} />

      <View style={styles.text}>
        <Text style={styles.label}>{ongoingSession.status}</Text>
        <Text style={styles.name} numberOfLines={1}>
          {ongoingSession.name}
        </Text>
      </View>

      <Tappable
        accessibilityRole="button"
        accessibilityLabel={`Resume chat with ${ongoingSession.name}`}
        onPress={onResume}
        style={styles.cta}
        hoveredStyle={styles.ctaPressed}
        pressedStyle={styles.ctaPressed}
      >
        <Text style={styles.ctaLabel}>Resume</Text>
      </Tappable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    backgroundColor: colors.saffronSoft,
    borderWidth: 1,
    borderColor: colors.saffronBorder,
    borderRadius: radius.lg,
    padding: space.md,
  },
  text: {
    flex: 1,
  },
  label: {
    ...type.caption,
    color: colors.saffronDeep,
  },
  name: {
    ...type.label,
    color: colors.ink,
  },
  cta: {
    paddingHorizontal: space.lg,
    paddingVertical: space.sm + 2,
    borderRadius: radius.sm,
    backgroundColor: colors.saffron,
  },
  ctaPressed: {
    backgroundColor: colors.saffronPressed,
  },
  ctaLabel: {
    ...type.label,
    color: colors.onSaffron,
  },
});
