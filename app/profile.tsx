import { Redirect, useRouter, type Href } from 'expo-router';
import React, { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Avatar, NavHeader, Screen, Tappable } from '@/components';
import { useOpenLink } from '@/components/CustomPageView';
import { AppIcon } from '@/config/icons';
import { useShownConfig } from '@/config/store';
import { t } from '@/config/strings';
import { profileGroups } from '@/data/content';
import { ChevronRight, LogOut } from '@/icons';
import { useOnboarding } from '@/store/onboarding';
import { GUTTER, colors, radius, space, type } from '@/theme';

type Row = { id: string; label: string; icon: string; href: string };

/** Profile & settings: who the app thinks you are, and where to change it. */
export default function ProfileScreen() {
  const router = useRouter();
  const { profile, hydrated, reset } = useOnboarding();
  const [confirmLogout, setConfirmLogout] = useState(false);
  const { branding } = useShownConfig();
  const openLink = useOpenLink();

  // "Help and support" is built from whatever contact details the dashboard
  // filled in; a group with nothing in it is not shown.
  const support: Row[] = [
    branding.supportEmail.trim() && { id: 'email', label: branding.supportEmail.trim(), icon: 'message', href: `mailto:${branding.supportEmail.trim()}` },
    branding.supportPhone.trim() && { id: 'phone', label: branding.supportPhone.trim(), icon: 'phone', href: `tel:${branding.supportPhone.replace(/s+/g, '')}` },
    branding.website.trim() && { id: 'web', label: 'Website', icon: 'arrow', href: branding.website.trim() },
    ...(['facebook', 'instagram', 'youtube', 'tiktok', 'x'] as const)
      .filter((key) => branding.socials[key].trim())
      .map((key) => ({ id: key, label: key === 'x' ? 'X' : key[0].toUpperCase() + key.slice(1), icon: 'arrow', href: branding.socials[key].trim() })),
  ].filter(Boolean) as Row[];

  const groups = [
    ...profileGroups,
    ...(support.length ? [{ title: t('profile.support'), items: support }] : []),
  ];

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
      <NavHeader title={t('profile.title')} bordered />

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

        {groups.map((group) => (
          <View key={group.title} style={styles.group}>
            <Text style={styles.groupTitle}>{group.title}</Text>

            <View style={styles.groupCard}>
              {group.items.map((item, index) => {
                return (
                  <Tappable
                    feel="card"
                    key={item.id}
                    accessibilityRole="button"
                    accessibilityLabel={item.label}
                    onPress={() => openLink(item.href)}
                    style={[styles.row, index > 0 && styles.rowDivider]}
                    hoveredStyle={styles.rowPressed}
                    pressedStyle={styles.rowPressed}
                  >
                    <AppIcon name={item.icon} size={20} color={colors.saffronDeep} />
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
              accessibilityLabel="Admin dashboard"
              onPress={() => router.push('/admin' as Href)}
              style={styles.row}
              hoveredStyle={styles.rowPressed}
              pressedStyle={styles.rowPressed}
            >
              <AppIcon name="shield" size={20} color={colors.saffronDeep} />
              <Text style={styles.rowLabel} numberOfLines={1}>
                Admin dashboard
              </Text>
              <ChevronRight size={18} color={colors.subtle} />
            </Tappable>
            <Tappable
              feel="card"
              accessibilityRole="button"
              accessibilityLabel="Log out"
              onPress={() => setConfirmLogout(true)}
              style={[styles.row, styles.rowDivider]}
              hoveredStyle={styles.rowPressed}
              pressedStyle={styles.rowPressed}
            >
              <LogOut size={20} color={colors.red} />
              <Text style={[styles.rowLabel, styles.logoutLabel]} numberOfLines={1}>
                {t('profile.logout')}
              </Text>
            </Tappable>
          </View>

          <Text style={styles.groupNote}>{t('profile.logoutNote')}</Text>
        </View>

        <Text style={styles.footer}>
          {branding.footer.trim() || `${branding.appName} · ${branding.tagline}`}
        </Text>
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
  footer: {
    ...type.caption,
    color: colors.subtle,
    textAlign: 'center',
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
