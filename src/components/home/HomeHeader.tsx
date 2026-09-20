import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { photos } from '@/data/images';
import { AriesAvatar, Close, Plus, Search, Wallet } from '@/icons';
import { colors, fontFamily, radius, shadow, weight } from '@/theme';

import { Avatar } from '../Avatar';
import { PressableScale } from '../PressableScale';

type HomeHeaderProps = {
  balance: number;
  /** "Good evening, Amrit" — computed from the clock and the saved profile. */
  greeting: string;
  /** Second line, e.g. "Sun 20 Sep · Shukla Navami". */
  contextLine: string;
  query: string;
  onQueryChange: (value: string) => void;
  onAddCash?: () => void;
  inputRef?: React.RefObject<TextInput | null>;
};

/**
 * Home top bar: zodiac avatar and wallet, the greeting, and the search field.
 *
 * The greeting sits between the chrome and the search rather than inside the
 * bar, so the row keeps the proportions of the reference design while the
 * screen still opens by telling you what day it is.
 */
export function HomeHeader({
  balance,
  greeting,
  contextLine,
  query,
  onQueryChange,
  onAddCash,
  inputRef,
}: HomeHeaderProps) {
  const router = useRouter();
  const hasQuery = query.length > 0;

  return (
    <View>
      <View style={styles.bar}>
        <PressableScale
          accessibilityRole="button"
          accessibilityLabel="Profile and settings"
          onPress={() => router.push('/profile')}
          scaleTo={0.92}
          style={styles.avatarWrap}
        >
          <View style={styles.zodiacAvatar}>
            <AriesAvatar size={48} />
          </View>
          <View style={styles.menuBadge}>
            <View style={styles.menuLine} />
            <View style={styles.menuLine} />
            <View style={styles.menuLine} />
          </View>
        </PressableScale>

        <View style={styles.right}>
          <PressableScale
            accessibilityRole="button"
            accessibilityLabel={`Wallet balance USD ${balance}. Add cash`}
            onPress={onAddCash}
            scaleTo={0.95}
            style={styles.walletPill}
          >
            <Wallet size={18} color="#4A4E55" />
            <Text style={styles.walletLabel}>USD {balance}</Text>
            <View style={styles.plusCircle}>
              <Plus size={11} color={colors.white} />
            </View>
          </PressableScale>

          <PressableScale
            accessibilityRole="button"
            accessibilityLabel="Your profile"
            onPress={() => router.push('/profile')}
            scaleTo={0.92}
            style={styles.userAvatar}
          >
            <Avatar uri={photos.userProfile} name="User" size={44} />
          </PressableScale>
        </View>
      </View>

      <View style={styles.greetingBlock}>
        <Text style={styles.greeting} numberOfLines={1}>
          {greeting}
        </Text>
        <Text style={styles.context} numberOfLines={1}>
          {contextLine}
        </Text>
      </View>

      <View style={styles.searchWrap}>
        <TextInput
          ref={inputRef}
          value={query}
          onChangeText={onQueryChange}
          placeholder="Search by name, skill or language"
          placeholderTextColor="#9AA0A6"
          style={styles.searchInput}
          returnKeyType="search"
          autoCorrect={false}
          autoCapitalize="none"
          accessibilityLabel="Search astrologers"
        />

        {hasQuery ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Clear search"
            onPress={() => onQueryChange('')}
            hitSlop={12}
            style={({ pressed }) => [styles.searchAction, pressed && styles.clearPressed]}
          >
            <View style={styles.clearCircle}>
              <Close size={11} color={colors.white} />
            </View>
          </Pressable>
        ) : (
          <View style={styles.searchAction} pointerEvents="none">
            <Search size={20} color="#9AA0A6" strokeWidth={2} />
          </View>
        )}
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
  greetingBlock: {
    paddingHorizontal: 18,
    paddingBottom: 12,
  },
  greeting: {
    fontFamily,
    fontSize: 23,
    lineHeight: 28,
    fontWeight: weight.bold,
    letterSpacing: -0.5,
    color: colors.inkStrong,
  },
  context: {
    fontFamily,
    fontSize: 13,
    lineHeight: 17,
    color: colors.muted,
    marginTop: 3,
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
  searchAction: {
    position: 'absolute',
    right: 14,
  },
  clearPressed: {
    opacity: 0.6,
  },
  clearCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#B9BCC1',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
