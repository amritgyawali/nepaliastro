import { Redirect } from 'expo-router';
import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { colors } from '@/theme';
import { useOnboarding } from '@/store/onboarding';

/**
 * Entry route. Sends returning users straight to the tabs and first-time
 * users into onboarding, once the persisted profile has been read back.
 */
export default function Index() {
  const { profile, hydrated } = useOnboarding();

  if (!hydrated) {
    return (
      <View style={styles.splash}>
        <ActivityIndicator color="#C9B42E" />
      </View>
    );
  }

  return <Redirect href={profile.completed ? '/(tabs)' : '/onboarding/name'} />;
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.cream,
  },
});
