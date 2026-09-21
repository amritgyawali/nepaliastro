import { Redirect } from 'expo-router';
import { Tabs, type BottomTabBarProps } from 'expo-router/tabs';
import React from 'react';

import { TabBar } from '@/components';
import { useOnboarding } from '@/store/onboarding';
import { colors } from '@/theme';

export default function TabsLayout() {
  const { profile, hydrated } = useOnboarding();

  // Nobody signed in — after a log out, or on a fresh install reached by a
  // deep link. The tabs are personal, so they send you back to question one.
  if (hydrated && !profile.completed) return <Redirect href="/onboarding/name" />;

  return (
    <Tabs
      tabBar={(props: BottomTabBarProps) => <TabBar {...props} />}
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: colors.white },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="services" options={{ title: 'Services' }} />
      <Tabs.Screen name="chat" options={{ title: 'Chat' }} />
      <Tabs.Screen name="call" options={{ title: 'Call' }} />
      <Tabs.Screen name="remedies" options={{ title: 'Remedies' }} />
    </Tabs>
  );
}
