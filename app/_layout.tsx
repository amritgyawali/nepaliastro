import { useFonts } from 'expo-font';
import { Stack, usePathname } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { AppState, Platform } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AdminProvider } from '@/admin/auth/store';
import { LaunchPopup, MaintenanceCover, PreviewStrip } from '@/components/AppOverlays';
import { ConfigProvider, useAppConfig, useShownConfig } from '@/config/store';
import { loadAnalytics, trackScreen, trackSession } from '@/lib/analytics';
import { OnboardingProvider } from '@/store/onboarding';
import { PredictionsProvider } from '@/store/predictions';
import { colors, fontAssets } from '@/theme';

// Hold the splash until Mukta is in memory, so no screen is ever painted in
// the system font and then reflowed.
SplashScreen.preventAutoHideAsync().catch(() => {
  /* Already hidden, or unavailable on this platform — nothing to hold. */
});

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.white }}>
      <SafeAreaProvider>
        <ConfigProvider>
          <AdminProvider>
            <OnboardingProvider>
              <PredictionsProvider>
                <App />
              </PredictionsProvider>
            </OnboardingProvider>
          </AdminProvider>
        </ConfigProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

/** Counts screens opened and app starts, for the dashboard's Analytics. */
function useUsageCounts() {
  const pathname = usePathname();

  useEffect(() => {
    loadAnalytics();
    trackSession();
    // Coming back after half an hour away counts as another start.
    let leftAt = 0;
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'background') leftAt = Date.now();
      if (state === 'active' && leftAt && Date.now() - leftAt > 30 * 60_000) trackSession();
    });
    return () => subscription.remove();
  }, []);

  useEffect(() => {
    trackScreen(pathname);
  }, [pathname]);
}

function App() {
  const [fontsLoaded, fontError] = useFonts(fontAssets);
  const { ready: configReady, mountKey } = useAppConfig();
  const { branding } = useShownConfig();
  const ready = (fontsLoaded || !!fontError) && configReady;

  useUsageCounts();

  useEffect(() => {
    if (ready) SplashScreen.hideAsync().catch(() => {});
  }, [ready]);

  useEffect(() => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') document.title = branding.appName;
  }, [branding.appName]);

  // Nothing is drawn until the fonts are in memory and the published config
  // has been applied, so no screen is ever painted in the wrong typeface or
  // the shipped colours and then redrawn. A font that fails to load is not
  // worth blocking for: the platform default stands in.
  if (!ready) return null;

  // `mountKey` moves on every publish, preview and rollback. Remounting the
  // navigator makes every screen draw again from the newly applied config.
  return (
    <>
      <StatusBar style="dark" />
      <Stack
        key={mountKey}
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
        <Stack.Screen name="patro" />
        <Stack.Screen name="date-converter" />
        <Stack.Screen name="dasha" />
        <Stack.Screen name="dosha" />
        <Stack.Screen name="muhurta" />
        <Stack.Screen name="lagna" />
        <Stack.Screen name="lucky" />
        <Stack.Screen name="festivals" />
        <Stack.Screen name="numerology" />
        <Stack.Screen name="gemstone" />
        <Stack.Screen name="naming" />
        <Stack.Screen name="transit" />
        <Stack.Screen name="varshaphal" />
        <Stack.Screen name="prashna" />
        <Stack.Screen name="vastu" />
        <Stack.Screen name="profile" />
        <Stack.Screen name="predictions" />
        <Stack.Screen name="prediction/[id]" />
        <Stack.Screen name="notifications" />
        <Stack.Screen name="page/[slug]" />
        <Stack.Screen name="admin" options={{ animation: 'fade' }} />
      </Stack>
      <MaintenanceCover />
      <LaunchPopup />
      <PreviewStrip />
    </>
  );
}
