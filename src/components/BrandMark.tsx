import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

import { imageSource } from '@/config/images';
import type { Branding } from '@/config/schema';
import { colors, font } from '@/theme';

/**
 * The app's mark: the logo the dashboard uploaded, or its monogram on the
 * brand colour. Shown on the loading and maintenance screens, and beside the
 * home greeting when the dashboard asks for it.
 */
export function BrandMark({ branding, size = 40 }: { branding: Branding; size?: number }) {
  const source = branding.logo ? imageSource(branding.logo) : undefined;
  const corner =
    branding.logoShape === 'circle' ? size / 2 : branding.logoShape === 'rounded' ? size * 0.24 : size * 0.06;

  return (
    <View
      accessibilityRole="image"
      accessibilityLabel={`${branding.appName} logo`}
      style={[
        styles.mark,
        { width: size, height: size, borderRadius: corner, backgroundColor: branding.logoBackground || colors.saffron },
      ]}
    >
      {source ? (
        <Image source={source} style={StyleSheet.absoluteFill} resizeMode="cover" />
      ) : (
        <Text style={[styles.monogram, { fontSize: size * 0.42, lineHeight: size * 0.56 }]}>
          {branding.logoMark.slice(0, 3)}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  mark: { alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  monogram: { fontFamily: font.bold, color: colors.onSaffron },
});
