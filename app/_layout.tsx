import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { OnboardingProvider } from '@/store/onboarding';
import { colors, fontAssets } from '@/theme';

// Hold the splash until Mukta is in memory, so no screen is ever painted in
// the system font and then reflowed.
SplashScreen.preventAutoHideAsync().catch(() => {
  /* Already hidden, or unavailable on this platform — nothing to hold. */
});

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts(fontAssets);
  const ready = fontsLoaded || !!fontError;

  useEffect(() => {
    if (ready) SplashScreen.hideAsync().catch(() => {});
  }, [ready]);

  // A font that fails to load is not worth blocking the app for: the platform
  // default stands in and everything still works.
  if (!ready) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.white }}>
      <SafeAreaProvider>
        <OnboardingProvider>
          <StatusBar style="dark" />
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: colors.white },
              animation: 'slide_from_right',
            }}
          >
            <Stack.Screen name="index" options={{ animation: 'none' }} />
            <Stack.Screen name="onboarding" />
            <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
            <Stack.Screen name="chat/[id]" />
            <Stack.Screen name="call/[id]" />
            <Stack.Screen name="astrologer/[id]" />
            <Stack.Screen name="remedy/[id]" />
            <Stack.Screen name="horoscope" />
            <Stack.Screen name="kundli" />
            <Stack.Screen name="matching" />
            <Stack.Screen name="panchang" />
            <Stack.Screen name="profile" />
          </Stack>
        </OnboardingProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
