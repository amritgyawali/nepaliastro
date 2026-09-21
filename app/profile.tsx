import { Redirect, useRouter, type Href } from 'expo-router';
import React, { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Avatar, NavHeader, Screen, Tappable } from '@/components';
import { profileGroups } from '@/data/content';
import {
  Calendar,
  ChevronRight,
  Headphones,
  KundliChart,
  LogOut,
  Lotus,
  MatchRings,
  MessageSquare,
  Star,
  Sunrise,
} from '@/icons';
import { useOnboarding } from '@/store/onboarding';
import { GUTTER, colors, radius, space, type } from '@/theme';

const ROW_ICONS = {
  message: MessageSquare,
  headphones: Headphones,
  lotus: Lotus,
  calendar: Calendar,
  kundli: KundliChart,
  star: Star,
  rings: MatchRings,
  sunrise: Sunrise,
} as const;

/** Profile & settings: who the app thinks you are, and where to change it. */
export default function ProfileScreen() {
  const router = useRouter();
  const { profile, hydrated, reset } = useOnboarding();
  const [confirmLogout, setConfirmLogout] = useState(false);

  // Reached with nobody signed in — a browser back after logging out, say.
  // Only once storage has been read, or a reload would bounce a real profile.
  const signedOut = hydrated && !profile.completed;

  const displayName = profile.name.trim() || 'Your profile';
  const details = [
    profile.birthPlace.trim() || null,
    profile.languages.length ? profile.languages.join(', ') : null,
  ]
    .filter(Boolean)
    .join(' · ');

  /**
   * Forgets the saved profile and drops the whole back stack, so the next
   * person starts at the first onboarding question with nothing of the
   * previous one left to swipe back to.
   */
  const logOut = () => {
    setConfirmLogout(false);
    reset();
    if (router.canDismiss()) router.dismissAll();
    router.replace('/onboarding/name');
  };

  if (signedOut) return <Redirect href="/onboarding/name" />;

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
                  <Tappable
                    feel="card"
                    key={item.id}
                    accessibilityRole="button"
                    accessibilityLabel={item.label}
                    onPress={() => router.push(item.href as Href)}
                    style={[styles.row, index > 0 && styles.rowDivider]}
                    hoveredStyle={styles.rowPressed}
                    pressedStyle={styles.rowPressed}
                  >
                    <Icon size={20} color={colors.saffronDeep} />
                    <Text style={styles.rowLabel} numberOfLines={1}>
                      {item.label}
                    </Text>
                    <ChevronRight size={18} color={colors.subtle} />
                  </Tappable>
                );
              })}
            </View>
          </View>
        ))}

        <View style={styles.group}>
          <Text style={styles.groupTitle}>Account</Text>

          <View style={styles.groupCard}>
            <Tappable
              feel="card"
              accessibilityRole="button"
              accessibilityLabel="Log out"
              onPress={() => setConfirmLogout(true)}
              style={styles.row}
              hoveredStyle={styles.rowPressed}
              pressedStyle={styles.rowPressed}
            >
              <LogOut size={20} color={colors.red} />
              <Text style={[styles.rowLabel, styles.logoutLabel]} numberOfLines={1}>
                Log out
              </Text>
            </Tappable>
          </View>

          <Text style={styles.groupNote}>
            Logging out clears the saved details on this device, so the next person
            starts from the first question.
          </Text>
        </View>
      </ScrollView>

      <Modal
        visible={confirmLogout}
        transparent
        animationType="fade"
        onRequestClose={() => setConfirmLogout(false)}
      >
        <Pressable style={styles.modalBackdrop} onPress={() => setConfirmLogout(false)}>
          <Pressable style={styles.modalCard} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.modalTitle}>Log out of this profile?</Text>
            <Text style={styles.modalBody}>
              Your name, birth details and languages are removed from this device.
              The app starts again at the first onboarding question.
            </Text>
            <View style={styles.modalActions}>
              <Tappable
                accessibilityRole="button"
                accessibilityLabel="Stay logged in"
                onPress={() => setConfirmLogout(false)}
                style={styles.modalCancel}
                pressedStyle={styles.pressed}
              >
                <Text style={styles.modalCancelLabel}>Stay signed in</Text>
              </Tappable>
              <Tappable
                accessibilityRole="button"
                accessibilityLabel="Confirm log out"
                onPress={logOut}
                style={styles.modalConfirm}
                pressedStyle={styles.pressed}
              >
                <Text style={styles.modalConfirmLabel}>Log out</Text>
              </Tappable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
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
  groupNote: {
    ...type.caption,
    color: colors.subtle,
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
  logoutLabel: {
    color: colors.red,
  },
  pressed: {
    opacity: 0.5,
  },

  modalBackdrop: {
    flex: 1,
    backgroundColor: colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: space.xl,
  },
  modalCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: space.xl,
  },
  modalTitle: {
    ...type.title,
    color: colors.ink,
  },
  modalBody: {
    ...type.body,
    color: colors.muted,
    marginTop: space.sm,
    marginBottom: space.xl,
  },
  modalActions: {
    flexDirection: 'row',
    gap: space.sm,
    alignSelf: 'stretch',
  },
  modalCancel: {
    flex: 1,
    paddingVertical: space.md + 2,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  modalCancelLabel: {
    ...type.label,
    color: colors.body,
  },
  modalConfirm: {
    flex: 1,
    paddingVertical: space.md + 2,
    borderRadius: radius.md,
    backgroundColor: colors.red,
    alignItems: 'center',
  },
  modalConfirmLabel: {
    ...type.label,
    color: colors.white,
  },
});
