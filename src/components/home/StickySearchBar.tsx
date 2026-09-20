import React from 'react';
import { Animated, StyleSheet, Text } from 'react-native';

import { photos } from '@/data/images';
import { Search } from '@/icons';
import { colors, fontFamily, radius, shadow, weight } from '@/theme';

import { Avatar } from '../Avatar';
import { PressableScale } from '../PressableScale';

/** Scroll distance over which the bar fades in — roughly the header's height. */
const FADE_FROM = 96;
const FADE_TO = 152;

type StickySearchBarProps = {
  scrollY: Animated.Value;
  /** The live query, so the collapsed bar shows what is being searched. */
  query: string;
  /** True once the bar is opaque enough to be worth tapping. */
  interactive: boolean;
  onPress: () => void;
  onAvatarPress: () => void;
};

/**
 * The condensed bar that takes over once the header has scrolled away.
 *
 * Search is the one control worth keeping within reach the whole way down the
 * feed; everything else in the header can go. Tapping it returns to the top
 * and puts the cursor in the real field, so there is only ever one input.
 */
export function StickySearchBar({
  scrollY,
  query,
  interactive,
  onPress,
  onAvatarPress,
}: StickySearchBarProps) {
  const opacity = scrollY.interpolate({
    inputRange: [FADE_FROM, FADE_TO],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });
  const translateY = scrollY.interpolate({
    inputRange: [FADE_FROM, FADE_TO],
    outputRange: [-12, 0],
    extrapolate: 'clamp',
  });

  return (
    <Animated.View
      style={[styles.bar, { opacity, transform: [{ translateY }] }]}
      pointerEvents={interactive ? 'box-none' : 'none'}
      accessibilityElementsHidden={!interactive}
      importantForAccessibility={interactive ? 'auto' : 'no-hide-descendants'}
    >
      <PressableScale
        accessibilityRole="search"
        accessibilityLabel={query ? `Searching for ${query}. Edit search` : 'Search astrologers'}
        onPress={onPress}
        scaleTo={0.98}
        containerStyle={styles.pillContainer}
        style={styles.pill}
      >
        <Search size={17} color="#9AA0A6" strokeWidth={2} />
        <Text style={query ? styles.pillQuery : styles.pillPlaceholder} numberOfLines={1}>
          {query || 'Search astrologers'}
        </Text>
      </PressableScale>

      <PressableScale
        accessibilityRole="button"
        accessibilityLabel="Your profile"
        onPress={onAvatarPress}
        scaleTo={0.92}
        style={styles.avatar}
      >
        <Avatar uri={photos.userProfile} name="User" size={36} />
      </PressableScale>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  bar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingTop: 8,
    paddingBottom: 10,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
    ...shadow(2, 0.04, 10),
  },
  pillContainer: {
    flex: 1,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    height: 40,
    paddingHorizontal: 14,
    borderRadius: radius.pill,
    backgroundColor: colors.sheet,
    borderWidth: 1,
    borderColor: '#E9E9E5',
  },
  pillPlaceholder: {
    fontFamily,
    fontSize: 14,
    color: '#9AA0A6',
    flexShrink: 1,
  },
  pillQuery: {
    fontFamily,
    fontSize: 14,
    fontWeight: weight.medium,
    color: colors.ink,
    flexShrink: 1,
  },
  avatar: {
    borderRadius: 18,
  },
});
