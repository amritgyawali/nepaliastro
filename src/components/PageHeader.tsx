import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useOnboarding } from '@/store/onboarding';
import { GUTTER, colors, space, type } from '@/theme';

import { Avatar } from './Avatar';

type PageHeaderProps = {
  title: string;
  subtitle: string;
};

/**
 * The top of a tab: what this screen is, one line of why, and the way to
 * your profile. Every tab wears the same one so the avatar never moves.
 */
export function PageHeader({ title, subtitle }: PageHeaderProps) {
  const router = useRouter();
  const { profile } = useOnboarding();

  return (
    <View style={styles.root}>
      <View style={styles.text}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Profile and settings"
        onPress={() => router.push('/profile')}
        hitSlop={6}
        style={({ pressed }) => pressed && styles.pressed}
      >
        <Avatar name={profile.name.trim() || 'You'} size={44} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: space.md,
    paddingHorizontal: GUTTER,
    paddingTop: space.sm,
    paddingBottom: space.lg,
  },
  text: {
    flexShrink: 1,
  },
  title: {
    ...type.display,
    color: colors.ink,
  },
  subtitle: {
    ...type.small,
    color: colors.muted,
  },
  pressed: {
    opacity: 0.6,
  },
});
