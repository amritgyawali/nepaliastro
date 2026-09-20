import { useRouter, type Href } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Avatar, NavHeader, Screen } from '@/components';
import { profileGroups } from '@/data/content';
import { Calendar, ChevronRight, Headphones, Lotus, MessageSquare } from '@/icons';
import { useOnboarding } from '@/store/onboarding';
import { GUTTER, colors, radius, space, type } from '@/theme';

const ROW_ICONS = {
  message: MessageSquare,
  headphones: Headphones,
  lotus: Lotus,
  calendar: Calendar,
} as const;

/** Profile & settings: who the app thinks you are, and where to change it. */
export default function ProfileScreen() {
  const router = useRouter();
  const { profile } = useOnboarding();

  const displayName = profile.name.trim() || 'Your profile';
  const details = [
    profile.birthPlace.trim() || null,
    profile.languages.length ? profile.languages.join(', ') : null,
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <Screen background={colors.white}>
      <NavHeader title="Profile" bordered />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.identity}>
          <Avatar name={displayName} size={56} />
          <View style={styles.identityText}>
            <Text style={styles.name} numberOfLines={1}>
              {displayName}
            </Text>
            <Text style={styles.details} numberOfLines={2}>
              {details || 'Add your birth details to personalise your readings'}
            </Text>
          </View>
        </View>

        {profileGroups.map((group) => (
          <View key={group.title} style={styles.group}>
            <Text style={styles.groupTitle}>{group.title}</Text>

            <View style={styles.groupCard}>
              {group.items.map((item, index) => {
                const Icon = ROW_ICONS[item.icon as keyof typeof ROW_ICONS];

                return (
                  <Pressable
                    key={item.id}
                    accessibilityRole="button"
                    accessibilityLabel={item.label}
                    onPress={() => router.push(item.href as Href)}
                    style={({ pressed }) => [
                      styles.row,
                      index > 0 && styles.rowDivider,
                      pressed && styles.rowPressed,
                    ]}
                  >
                    <Icon size={20} color={colors.saffronDeep} />
                    <Text style={styles.rowLabel} numberOfLines={1}>
                      {item.label}
                    </Text>
                    <ChevronRight size={18} color={colors.subtle} />
                  </Pressable>
                );
              })}
            </View>
          </View>
        ))}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: GUTTER,
    paddingTop: space.lg,
    paddingBottom: space.xxl,
    gap: space.xl,
  },
  identity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
  },
  identityText: {
    flex: 1,
  },
  name: {
    ...type.title,
    color: colors.ink,
  },
  details: {
    ...type.small,
    color: colors.muted,
  },
  group: {
    gap: space.sm,
  },
  groupTitle: {
    ...type.caption,
    color: colors.muted,
  },
  groupCard: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    paddingHorizontal: space.lg,
    paddingVertical: space.lg,
  },
  rowDivider: {
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  rowPressed: {
    backgroundColor: colors.fill,
  },
  rowLabel: {
    ...type.label,
    color: colors.ink,
    flex: 1,
  },
});
