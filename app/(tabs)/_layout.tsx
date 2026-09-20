import { Tabs, type BottomTabBarProps } from 'expo-router/tabs';
import React from 'react';

import { TabBar } from '@/components';
import { colors } from '@/theme';

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props: BottomTabBarProps) => <TabBar {...props} />}
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: colors.cream },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="chat" options={{ title: 'Chat' }} />
      <Tabs.Screen name="call" options={{ title: 'Call' }} />
      <Tabs.Screen name="remedies" options={{ title: 'Remedies' }} />
    </Tabs>
  );
}
