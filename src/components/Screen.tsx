import React from 'react';
import { Platform, StyleSheet, View, ViewStyle } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';

import { SCREEN_MAX_WIDTH, colors } from '@/theme';

type ScreenProps = {
  children: React.ReactNode;
  /** Page background. White unless a screen says otherwise. */
  background?: string;
  /** Which sides get safe-area padding. Defaults to the top only. */
  edges?: readonly Edge[];
  style?: ViewStyle;
};

/**
 * Page shell for every route.
 *
 * On a wide viewport (desktop web, tablet) the content is capped at a
 * phone-sized column and centred; on a phone it simply fills the screen.
 */
export function Screen({
  children,
  background = colors.white,
  edges = ['top'],
  style,
}: ScreenProps) {
  return (
    <View style={[styles.page, { backgroundColor: background }]}>
      <SafeAreaView
        edges={edges}
        style={[styles.canvas, { backgroundColor: background }, style]}
      >
        {children}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    alignItems: 'center',
  },
  canvas: {
    flex: 1,
    width: '100%',
    maxWidth: SCREEN_MAX_WIDTH,
    ...Platform.select({
      web: {
        borderLeftWidth: 1,
        borderRightWidth: 1,
        borderColor: colors.hairline,
      },
      default: {},
    }),
  },
});
