// expo-router vendors react-navigation's bottom tabs behind `expo-router/tabs`,
// so the props type comes from there rather than a separate package.
import type { BottomTabBarProps } from 'expo-router/tabs';
import React, { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppIcon } from '@/config/icons';
import { useShownConfig } from '@/config/store';
import { ChatDots, Home, Phone, PrayingHands, Sparkle } from '@/icons';
import { SCREEN_MAX_WIDTH, TAB_BAR_HEIGHT, colors, font, motion, radius, space, type } from '@/theme';

const TAB_ICONS = {
  index: Home,
  services: Sparkle,
  chat: ChatDots,
  call: Phone,
  remedies: PrayingHands,
} as const;

/**
 * A plain bottom bar: five tabs, icon over label, saffron for the current one.
 *
 * It sits in the layout rather than floating over it, so nothing is ever
 * hidden behind it and no screen has to reserve space for it. The tab that
 * becomes current lifts its icon two points and draws a short saffron rule
 * above it — the only movement in the bar, and only on a change.
 */
export function TabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const { tabs } = useShownConfig().navigation;

  return (
    <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, space.sm) }]}>
      <View style={styles.row}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          // A tab the dashboard hid keeps its route, so links to it still
          // work, but gets no button in the bar.
          const tab = tabs.find((candidate) => candidate.id === route.name);
          if (tab && !tab.visible) return null;
          const label = options.title ?? route.name;
          const focused = state.index === index;
          const fallback = TAB_ICONS[route.name as keyof typeof TAB_ICONS] ?? Home;
          const tint = focused ? colors.saffronDeep : colors.muted;
          const icon = tab ? (
            <AppIcon name={tab.icon} size={24} color={tint} filled={focused} />
          ) : (
            React.createElement(fallback, { size: 24, color: tint, filled: focused })
          );

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
              <TabMark focused={focused} />
              <TabIcon focused={focused}>{icon}</TabIcon>
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

/** The short rule over the current tab, drawn out from its centre. */
function TabMark({ focused }: { focused: boolean }) {
  const reduceMotion = useReducedMotion();
  const shown = useSharedValue(focused ? 1 : 0);

  useEffect(() => {
    const target = focused ? 1 : 0;
    shown.value = reduceMotion ? target : withTiming(target, motion.link);
  }, [focused, reduceMotion, shown]);

  const style = useAnimatedStyle(() => ({
    opacity: shown.value,
    transform: [{ scaleX: shown.value }],
  }));

  return <Animated.View style={[styles.mark, style]} />;
}

/** The icon's small lift when its tab becomes the current one. */
function TabIcon({ focused, children }: { focused: boolean; children: React.ReactNode }) {
  const reduceMotion = useReducedMotion();
  const lift = useSharedValue(focused ? 1 : 0);

  useEffect(() => {
    const target = focused ? 1 : 0;
    lift.value = reduceMotion ? target : withSpring(target, motion.tabSpring);
  }, [focused, reduceMotion, lift]);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: -2 * lift.value }],
  }));

  return <Animated.View style={style}>{children}</Animated.View>;
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
  mark: {
    position: 'absolute',
    top: 0,
    width: 28,
    height: 3,
    borderBottomLeftRadius: radius.sm,
    borderBottomRightRadius: radius.sm,
    backgroundColor: colors.saffron,
  },
  label: {
    ...type.caption,
  },
  labelActive: {
    fontFamily: font.semibold,
  },
});
