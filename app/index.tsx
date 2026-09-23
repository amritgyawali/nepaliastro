import { Redirect, type Href } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { BrandMark } from '@/components/BrandMark';
import { useAppConfig, useShownConfig } from '@/config/store';
import { colors, space } from '@/theme';
import { useOnboarding } from '@/store/onboarding';

/**
 * Entry route. Sends returning users to the tab the dashboard chose and
 * first-time users into onboarding, once the persisted profile has been read
 * back. After a publish remounts the app, it returns the admin to the
 * dashboard page they published from.
 */
export default function Index() {
  const { profile, hydrated } = useOnboarding();
  const { takeReturnTo } = useAppConfig();
  const { branding, navigation } = useShownConfig();
  // Read once: a second render must not send them there again.
  const [returnTo] = useState(takeReturnTo);

  if (returnTo) return <Redirect href={returnTo as Href} />;

  if (!hydrated) {
    return (
      <View style={[styles.splash, branding.logoBackground ? { backgroundColor: branding.logoBackground } : null]}>
        <BrandMark branding={branding} size={72} />
        <ActivityIndicator color={colors.saffron} style={styles.spinner} />
      </View>
    );
  }

  const landing = navigation.tabs.find((tab) => tab.id === navigation.landingTab && tab.visible);
  const home = landing && landing.id !== 'index' ? `/(tabs)/${landing.id}` : '/(tabs)';

  return <Redirect href={(profile.completed ? home : '/onboarding/name') as Href} />;
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
  },
  spinner: {
    marginTop: space.xl,
  },
});
