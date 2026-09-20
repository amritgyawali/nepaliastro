import React, { useEffect, useState } from 'react';
import { Image, StyleSheet, Text, View, ViewStyle } from 'react-native';

import { colors, font } from '@/theme';

type AvatarProps = {
  uri?: string;
  name: string;
  size: number;
  style?: ViewStyle;
};

type LoadState = 'loading' | 'ready' | 'failed';

/**
 * Circular portrait with an initials fallback, so a slow or dead image URL
 * never leaves a hole in the layout.
 */
export function Avatar({ uri, name, size, style }: AvatarProps) {
  const [state, setState] = useState<LoadState>(uri ? 'loading' : 'failed');

  // A recycled card can be handed a different portrait; start that one over.
  useEffect(() => {
    setState(uri ? 'loading' : 'failed');
  }, [uri]);

  const circle = { width: size, height: size, borderRadius: size / 2 };

  return (
    <View style={[styles.root, circle, style]}>
      <View style={[styles.fallback, circle]}>
        <Text style={[styles.initials, { fontSize: Math.max(12, size * 0.36) }]}>
          {initialsOf(name)}
        </Text>
      </View>

      {uri && state !== 'failed' ? (
        <Image
          source={{ uri }}
          onLoad={() => setState('ready')}
          onError={() => setState('failed')}
          style={[StyleSheet.absoluteFill, circle]}
          resizeMode="cover"
          accessibilityLabel={name}
        />
      ) : null}
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
  root: {
    overflow: 'hidden',
    backgroundColor: colors.saffronSoft,
  },
  fallback: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.saffronSoft,
  },
  initials: {
    fontFamily: font.semibold,
    color: colors.saffronDeep,
  },
});
