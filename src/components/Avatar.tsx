import React, { useState } from 'react';
import { Image, StyleSheet, Text, View, ViewStyle } from 'react-native';

import { colors, fontFamily, weight } from '@/theme';

type AvatarProps = {
  uri?: string;
  name: string;
  size: number;
  /** Draws the gold ring seen around astrologer portraits. */
  ring?: boolean;
  ringColor?: string;
  ringWidth?: number;
  style?: ViewStyle;
};

/**
 * Circular portrait with a themed initials fallback, so a slow or dead image
 * URL never leaves a hole in the layout.
 */
export function Avatar({
  uri,
  name,
  size,
  ring = false,
  ringColor = colors.yellowAvatarRing,
  ringWidth = 1.5,
  style,
}: AvatarProps) {
  const [failed, setFailed] = useState(false);
  const inner = ring ? size - ringWidth * 2 - 4 : size;

  return (
    <View
      style={[
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          alignItems: 'center',
          justifyContent: 'center',
        },
        ring && {
          borderWidth: ringWidth,
          borderColor: ringColor,
          padding: 2,
        },
        style,
      ]}
    >
      {uri && !failed ? (
        <Image
          source={{ uri }}
          onError={() => setFailed(true)}
          style={{ width: inner, height: inner, borderRadius: inner / 2 }}
          resizeMode="cover"
          accessibilityLabel={name}
        />
      ) : (
        <View
          style={[
            styles.fallback,
            { width: inner, height: inner, borderRadius: inner / 2 },
          ]}
        >
          <Text style={[styles.initials, { fontSize: Math.max(11, inner * 0.36) }]}>
            {initialsOf(name)}
          </Text>
        </View>
      )}
    </View>
  );
}

function initialsOf(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

const styles = StyleSheet.create({
  fallback: {
    backgroundColor: colors.yellowSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    fontFamily,
    fontWeight: weight.bold,
    color: '#8A7233',
    letterSpacing: 0.3,
  },
});
