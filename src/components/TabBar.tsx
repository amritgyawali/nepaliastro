// expo-router vendors react-navigation's bottom tabs behind `expo-router/tabs`,
// so the props type comes from there rather than a separate package.
import type { BottomTabBarProps } from 'expo-router/tabs';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ChatDots, Home, Phone, PrayingHands } from '@/icons';
import { SCREEN_MAX_WIDTH, colors, fontFamily, radius, shadow, weight } from '@/theme';

const TAB_ICONS = {
  index: Home,
  chat: ChatDots,
  call: Phone,
  remedies: PrayingHands,
} as const;

/**
 * The floating grey pill at the bottom of every main tab.
 *
 * The active tab sits inside a darker rounded capsule with a filled glyph;
 * inactive tabs use outline glyphs. The Chat tab keeps its blue accent when
 * inactive, matching the reference screenshots.
 */
export function TabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[styles.wrapper, { paddingBottom: Math.max(insets.bottom, 10) }]}
      pointerEvents="box-none"
    >
      <View style={styles.pill}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const label = options.title ?? route.name;
          const focused = state.index === index;
          const Icon = TAB_ICONS[route.name as keyof typeof TAB_ICONS] ?? Home;

          const inactiveColor = route.name === 'chat' ? '#3E7BD6' : colors.navIcon;
          const iconColor = focused ? colors.navIconActive : inactiveColor;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!focused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <Pressable
              key={route.key}
              accessibilityRole="button"
              accessibilityState={focused ? { selected: true } : {}}
              accessibilityLabel={label}
              onPress={onPress}
              onLongPress={() =>
                navigation.emit({ type: 'tabLongPress', target: route.key })
              }
              style={styles.tab}
            >
              <View style={[styles.tabInner, focused && styles.tabInnerActive]}>
                <Icon
                  size={24}
                  color={iconColor}
                  // Remedies keeps the outline namaste mark even when active.
                  filled={focused && route.name !== 'remedies'}
                />
                <Text
                  style={[
                    styles.label,
                    { color: focused ? colors.navIconActive : colors.navIcon },
                    focused && styles.labelActive,
                  ]}
                >
                  {label}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    paddingHorizontal: 14,
  },
  pill: {
    width: '100%',
    maxWidth: SCREEN_MAX_WIDTH - 28,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.navBg,
    borderRadius: radius.pill,
    padding: 6,
    ...shadow(6, 0.12, 20),
  },
  tab: {
    flex: 1,
  },
  tabInner: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 7,
    borderRadius: radius.pill,
  },
  tabInnerActive: {
    backgroundColor: colors.navActive,
  },
  label: {
    fontFamily,
    fontSize: 11,
    fontWeight: weight.medium,
    marginTop: 3,
  },
  labelActive: {
    fontWeight: weight.bold,
  },
});
