// expo-router vendors react-navigation's bottom tabs behind `expo-router/tabs`,
// so the props type comes from there rather than a separate package.
import type { BottomTabBarProps } from 'expo-router/tabs';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ChatDots, Home, Phone, PrayingHands } from '@/icons';
import { SCREEN_MAX_WIDTH, TAB_BAR_HEIGHT, colors, font, space, type } from '@/theme';

const TAB_ICONS = {
  index: Home,
  chat: ChatDots,
  call: Phone,
  remedies: PrayingHands,
} as const;

/**
 * A plain bottom bar: four tabs, icon over label, saffron for the current one.
 *
 * It sits in the layout rather than floating over it, so nothing is ever
 * hidden behind it and no screen has to reserve space for it.
 */
export function TabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, space.sm) }]}>
      <View style={styles.row}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const label = options.title ?? route.name;
          const focused = state.index === index;
          const Icon = TAB_ICONS[route.name as keyof typeof TAB_ICONS] ?? Home;
          const tint = focused ? colors.saffronDeep : colors.muted;

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
              style={({ pressed }) => [styles.tab, pressed && styles.pressed]}
            >
              <Icon size={24} color={tint} filled={focused} />
              <Text style={[styles.label, { color: tint }, focused && styles.labelActive]}>
                {label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  row: {
    width: '100%',
    maxWidth: SCREEN_MAX_WIDTH,
    height: TAB_BAR_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    paddingTop: space.xs,
  },
  pressed: {
    opacity: 0.6,
  },
  label: {
    ...type.caption,
  },
  labelActive: {
    fontFamily: font.semibold,
  },
});
