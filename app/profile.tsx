import { useRouter, type Href } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { NavHeader, Screen } from '@/components';
import { profileGroups } from '@/data/content';
import {
  AriesAvatar,
  ChevronRight,
  Edit,
  Gem,
  Gift,
  GridOutline,
  Headphones,
  History,
  Home,
  Lotus,
  MessageSquare,
  Users,
  Wallet,
} from '@/icons';
import { colors, fontFamily, radius, shadow, weight } from '@/theme';
import { useOnboarding } from '@/store/onboarding';

const ROW_ICONS = {
  message: MessageSquare,
  home: Home,
  grid: GridOutline,
  lotus: Lotus,
  gem: Gem,
  users: Users,
  headphones: Headphones,
  gift: Gift,
} as const;

/** Profile & Settings — design/profile_settings. */
export default function ProfileScreen() {
  const router = useRouter();
  const { profile } = useOnboarding();

  const displayName = profile.name.trim() || 'User';

  return (
    <Screen background={colors.white}>
      <NavHeader title="Profile & Settings" bordered />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Identity card */}
        <View style={styles.userCard}>
          <View style={styles.userLeft}>
            <View style={styles.userAvatar}>
              <AriesAvatar size={64} />
            </View>
            <Text style={styles.userName}>{displayName}</Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Edit profile"
            onPress={() => router.push('/onboarding/name')}
            style={({ pressed }) => [styles.editButton, pressed && styles.pressed]}
          >
            <Edit size={16} color="#7A7E85" />
          </Pressable>
        </View>

        {/* Quick actions */}
        <View style={styles.quickRow}>
          <QuickCard label="My Orders" icon={<History size={20} color="#5A5F67" />} />
          <QuickCard
            label="Wallet"
            icon={<Wallet size={20} color="#5A5F67" />}
            badge="USD 0"
          />
          <QuickCard label="Support Chat" icon={<Headphones size={20} color="#5A5F67" />} />
        </View>

        {/* Grouped lists */}
        {profileGroups.map((group) => (
          <View key={group.title} style={styles.group}>
            <Text style={styles.groupTitle}>{group.title}</Text>
            <View style={styles.groupCard}>
              {group.items.map((item, index) => {
                const Icon = ROW_ICONS[item.icon as keyof typeof ROW_ICONS];
                const href = 'href' in item ? (item.href as Href) : undefined;
                return (
                  <Pressable
                    key={item.id}
                    accessibilityRole="button"
                    accessibilityLabel={item.label}
                    onPress={() => href && router.push(href)}
                    style={({ pressed }) => [
                      styles.row,
                      index > 0 && styles.rowDivider,
                      pressed && styles.rowPressed,
                    ]}
                  >
                    <View style={styles.rowLeft}>
                      <View style={styles.rowIcon}>
                        <Icon size={17} color="#5A5F67" />
                      </View>
                      <Text style={styles.rowLabel}>{item.label}</Text>
                    </View>
                    <ChevronRight size={16} color="#C1C3C8" />
                  </Pressable>
                );
              })}
            </View>
          </View>
        ))}

        <View style={styles.group}>
          <Text style={styles.groupTitle}>SERVICES</Text>
          <View style={styles.servicesStub} />
        </View>
      </ScrollView>
    </Screen>
  );
}

function QuickCard({
  label,
  icon,
  badge,
}: {
  label: string;
  icon: React.ReactNode;
  badge?: string;
}) {
  return (
    <View style={styles.quickCard}>
      <View style={styles.quickTop}>
        <View style={styles.quickIcon}>{icon}</View>
        {badge ? (
          <View style={styles.quickBadge}>
            <Text style={styles.quickBadgeLabel}>{badge}</Text>
          </View>
        ) : null}
      </View>
      <Text style={styles.quickLabel} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: colors.appGrey,
  },
  content: {
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 40,
    gap: 20,
  },
  pressed: {
    opacity: 0.7,
  },

  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: '#F0F0EE',
    padding: 16,
    ...shadow(1, 0.02),
  },
  userLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    flexShrink: 1,
  },
  userAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    overflow: 'hidden',
  },
  userName: {
    fontFamily,
    fontSize: 20,
    fontWeight: weight.bold,
    letterSpacing: -0.4,
    color: '#141517',
    flexShrink: 1,
  },
  editButton: {
    width: 32,
    height: 32,
    borderRadius: 9,
    backgroundColor: '#F5F6F6',
    alignItems: 'center',
    justifyContent: 'center',
  },

  quickRow: {
    flexDirection: 'row',
    gap: 12,
  },
  quickCard: {
    flex: 1,
    height: 118,
    justifyContent: 'space-between',
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: '#ECECEB',
    padding: 14,
    ...shadow(1, 0.015),
  },
  quickTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  quickIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EAECEF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickBadge: {
    backgroundColor: colors.greenSoft,
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 4,
  },
  quickBadgeLabel: {
    fontFamily,
    fontSize: 11,
    fontWeight: weight.medium,
    color: colors.greenSoftText,
  },
  quickLabel: {
    fontFamily,
    fontSize: 14,
    fontWeight: weight.medium,
    letterSpacing: -0.2,
    color: '#1A1A1B',
  },

  group: {
    gap: 8,
  },
  groupTitle: {
    fontFamily,
    fontSize: 13,
    fontWeight: weight.semibold,
    letterSpacing: 0.8,
    color: '#797D84',
    paddingHorizontal: 4,
  },
  groupCard: {
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: '#ECECEB',
    overflow: 'hidden',
    ...shadow(1, 0.015),
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  rowDivider: {
    borderTopWidth: 1,
    borderTopColor: '#F1F1F0',
  },
  rowPressed: {
    backgroundColor: '#F9F9F8',
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    flexShrink: 1,
  },
  rowIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EAECEF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowLabel: {
    fontFamily,
    fontSize: 16,
    fontWeight: weight.medium,
    color: '#18191B',
    flexShrink: 1,
  },
  servicesStub: {
    height: 28,
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: '#ECECEB',
  },
});
