import { Redirect } from 'expo-router';
import { Tabs, type BottomTabBarProps } from 'expo-router/tabs';
import React from 'react';

import { TabBar } from '@/components';
import { useShownConfig } from '@/config/store';
import { useOnboarding } from '@/store/onboarding';
import { colors } from '@/theme';

export default function TabsLayout() {
  const { profile, hydrated } = useOnboarding();
  const { tabs } = useShownConfig().navigation;

  // Nobody signed in — after a log out, or on a fresh install reached by a
  // deep link. The tabs are personal, so they send you back to question one.
  if (hydrated && !profile.completed) return <Redirect href="/onboarding/name" />;

  // The dashboard sets the order, the names and which tabs show. Every tab
  // is still declared, hidden or not, so a link to one keeps working.
  return (
    <Tabs
      tabBar={(props: BottomTabBarProps) => <TabBar {...props} />}
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: colors.white },
      }}
    >
      {tabs.map((tab) => (
        <Tabs.Screen key={tab.id} name={tab.id} options={{ title: tab.title }} />
      ))}
    </Tabs>
  );
}
