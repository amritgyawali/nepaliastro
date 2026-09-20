import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { photos } from '@/data/images';
import { AriesAvatar, Plus, Search, Wallet } from '@/icons';
import { colors, fontFamily, radius, shadow, weight } from '@/theme';

import { Avatar } from '../Avatar';

type HomeHeaderProps = {
  balance: number;
  query: string;
  onQueryChange: (value: string) => void;
  onAddCash?: () => void;
};

/** Home top bar: zodiac avatar, wallet pill and the user's own avatar. */
export function HomeHeader({ balance, query, onQueryChange, onAddCash }: HomeHeaderProps) {
  const router = useRouter();

  return (
    <View>
      <View style={styles.bar}>
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

        <View style={styles.right}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Wallet balance USD ${balance}. Add cash`}
            onPress={onAddCash}
            style={({ pressed }) => [styles.walletPill, pressed && styles.pressed]}
          >
            <Wallet size={18} color="#4A4E55" />
            <Text style={styles.walletLabel}>USD {balance}</Text>
            <View style={styles.plusCircle}>
              <Plus size={11} color={colors.white} />
            </View>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Your profile"
            onPress={() => router.push('/profile')}
            style={({ pressed }) => [styles.userAvatar, pressed && styles.pressed]}
          >
            <Avatar uri={photos.userProfile} name="User" size={44} />
          </Pressable>
        </View>
      </View>

      <View style={styles.searchWrap}>
        <TextInput
          value={query}
          onChangeText={onQueryChange}
          placeholder="Search"
          placeholderTextColor="#9AA0A6"
          style={styles.searchInput}
          returnKeyType="search"
          accessibilityLabel="Search astrologers"
        />
        <View style={styles.searchIcon} pointerEvents="none">
          <Search size={20} color="#9AA0A6" strokeWidth={2} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingTop: 6,
    paddingBottom: 10,
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
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  walletPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    height: 44,
    paddingHorizontal: 16,
    borderRadius: radius.pill,
    backgroundColor: '#E5E4DF',
  },
  walletLabel: {
    fontFamily,
    fontSize: 15,
    fontWeight: weight.medium,
    color: '#2C2C2E',
  },
  plusCircle: {
    width: 19,
    height: 19,
    borderRadius: 10,
    backgroundColor: '#2E2E30',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userAvatar: {
    borderRadius: 24,
  },
  searchWrap: {
    marginHorizontal: 18,
    marginBottom: 6,
    justifyContent: 'center',
    borderRadius: radius.lg,
    ...shadow(1, 0.03),
  },
  searchInput: {
    height: 48,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: '#E4E5E7',
    backgroundColor: colors.white,
    paddingLeft: 16,
    paddingRight: 46,
    fontFamily,
    fontSize: 15,
    color: colors.ink,
  },
  searchIcon: {
    position: 'absolute',
    right: 14,
  },
});
