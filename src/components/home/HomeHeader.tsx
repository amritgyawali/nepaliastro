import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { Close, Search } from '@/icons';
import { useOnboarding } from '@/store/onboarding';
import { GUTTER, TOUCH_SIZE, colors, radius, space, type } from '@/theme';

import { Avatar } from '../Avatar';
import { Tappable } from '../Tappable';

type HomeHeaderProps = {
  /** "Good evening, Amrit" — from the clock and the saved profile. */
  greeting: string;
  /** Second line, e.g. "Sun 20 Sep · Shukla Navami". */
  contextLine: string;
  query: string;
  onQueryChange: (value: string) => void;
  inputRef?: React.RefObject<TextInput | null>;
};

/**
 * Home top bar: who you are and what day it is, then the search field.
 *
 * Nothing else lives up here. A wallet the app cannot spend and a second
 * avatar were two taps that led nowhere, so the row is down to the one
 * control that goes somewhere — your profile — and the one that finds people.
 */
export function HomeHeader({
  greeting,
  contextLine,
  query,
  onQueryChange,
  inputRef,
}: HomeHeaderProps) {
  const router = useRouter();
  const { profile } = useOnboarding();
  const hasQuery = query.length > 0;

  return (
    <View style={styles.root}>
      <View style={styles.bar}>
        <View style={styles.greetingBlock}>
          <Text style={styles.greeting} numberOfLines={1}>
            {greeting}
          </Text>
          <Text style={styles.context} numberOfLines={1}>
            {contextLine}
          </Text>
        </View>

        <Tappable
          feel="icon"
          accessibilityRole="button"
          accessibilityLabel="Profile and settings"
          onPress={() => router.push('/profile')}
          hitSlop={6}
          pressedStyle={styles.pressed}
        >
          <Avatar name={profile.name.trim() || 'You'} size={44} />
        </Tappable>
      </View>

      <View style={styles.searchWrap}>
        <View style={styles.searchIcon} pointerEvents="none">
          <Search size={19} color={colors.subtle} strokeWidth={2} />
        </View>

        <TextInput
          ref={inputRef}
          value={query}
          onChangeText={onQueryChange}
          placeholder="Search astrologers"
          placeholderTextColor={colors.subtle}
          style={styles.searchInput}
          returnKeyType="search"
          autoCorrect={false}
          autoCapitalize="none"
          accessibilityLabel="Search astrologers by name, skill or language"
        />

        {hasQuery ? (
          <Tappable
            feel="icon"
            accessibilityRole="button"
            accessibilityLabel="Clear search"
            onPress={() => onQueryChange('')}
            hitSlop={12}
            style={styles.clear}
            pressedStyle={styles.pressed}
          >
            <Close size={13} color={colors.muted} strokeWidth={2.4} />
          </Tappable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    paddingTop: space.sm,
    paddingBottom: space.md,
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: space.md,
    paddingHorizontal: GUTTER,
  },
  greetingBlock: {
    flexShrink: 1,
  },
  greeting: {
    ...type.display,
    color: colors.ink,
  },
  context: {
    ...type.small,
    color: colors.muted,
  },
  pressed: {
    opacity: 0.6,
  },
  searchWrap: {
    marginTop: space.lg,
    marginHorizontal: GUTTER,
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    borderRadius: radius.md,
    backgroundColor: colors.fill,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: space.md,
  },
  searchIcon: {
    marginRight: space.sm,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    ...type.body,
    color: colors.ink,
  },
  clear: {
    width: TOUCH_SIZE - 20,
    height: TOUCH_SIZE - 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
