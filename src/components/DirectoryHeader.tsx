import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AriesAvatar, MessengerBubble, Plus, Search, Wallet } from '@/icons';
import { colors, fontFamily, radius, weight } from '@/theme';

type DirectoryHeaderProps = {
  /** Wallet balance shown inside the pill; `null` renders "Add Cash". */
  balance?: number | null;
  onSearch?: () => void;
  onMessages?: () => void;
  onAddCash?: () => void;
};

/**
 * Top bar shared by the two astrologer directories: profile avatar with a
 * hamburger badge, a wallet pill, and two circular action buttons.
 */
export function DirectoryHeader({
  balance = null,
  onSearch,
  onMessages,
  onAddCash,
}: DirectoryHeaderProps) {
  const router = useRouter();

  return (
    <View style={styles.root}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Profile and settings"
        onPress={() => router.push('/profile')}
        style={({ pressed }) => [styles.avatarWrap, pressed && styles.pressed]}
      >
        <View style={styles.zodiacAvatar}>
          <AriesAvatar size={48} />
        </View>
        <View style={styles.menuBadge}>
          <View style={styles.menuLine} />
          <View style={styles.menuLine} />
          <View style={styles.menuLine} />
        </View>
      </Pressable>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={balance === null ? 'Add cash' : `Wallet balance USD ${balance}`}
        onPress={onAddCash}
        style={({ pressed }) => [styles.walletPill, pressed && styles.pressed]}
      >
        <Wallet size={18} color="#4A4E55" />
        <Text style={styles.walletLabel}>
          {balance === null ? 'Add Cash' : `USD ${balance}`}
        </Text>
        <View style={styles.plusCircle}>
          <Plus size={11} color={colors.white} />
        </View>
      </Pressable>

      <View style={styles.actions}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Search"
          onPress={onSearch}
          style={({ pressed }) => [styles.circleButton, pressed && styles.pressed]}
        >
          <Search size={21} color="#41454B" />
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Messages"
          onPress={onMessages}
          style={({ pressed }) => [styles.circleButton, pressed && styles.pressed]}
        >
          <MessengerBubble size={22} color="#41454B" />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingTop: 8,
    paddingBottom: 12,
    gap: 8,
  },
  avatarWrap: {
    width: 48,
    height: 48,
  },
  zodiacAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    overflow: 'hidden',
  },
  pressed: {
    opacity: 0.75,
  },
  menuBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: '#E6E6E3',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  menuLine: {
    width: 10,
    height: 1.5,
    borderRadius: 1,
    backgroundColor: '#3F4348',
  },
  walletPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    height: 44,
    paddingHorizontal: 14,
    borderRadius: radius.pill,
    backgroundColor: '#E5E4DF',
  },
  walletLabel: {
    fontFamily,
    fontSize: 15,
    fontWeight: weight.medium,
    color: '#2C2C2E',
    letterSpacing: -0.2,
  },
  plusCircle: {
    width: 19,
    height: 19,
    borderRadius: 10,
    backgroundColor: '#2E2E30',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  circleButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E5E4DF',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
