import React, { useEffect, useState } from 'react';
import { Image, StyleSheet, Text, View, ViewStyle } from 'react-native';

import { colors, fontFamily, weight } from '@/theme';

import { Skeleton } from './Skeleton';

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

type LoadState = 'loading' | 'ready' | 'failed';

/**
 * Circular portrait with a themed initials fallback, so a slow or dead image
 * URL never leaves a hole in the layout.
 *
 * The portraits are fetched from a CDN, so until one arrives the circle holds
 * a pulsing placeholder rather than empty space — on a cold start a rail of
 * these reads as "loading" instead of "broken".
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
  const [state, setState] = useState<LoadState>(uri ? 'loading' : 'failed');
  const inner = ring ? size - ringWidth * 2 - 4 : size;

  // A recycled card can be handed a different portrait; start that one over.
  useEffect(() => {
    setState(uri ? 'loading' : 'failed');
  }, [uri]);

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
      {uri && state !== 'failed' ? (
        <>
          <Image
            source={{ uri }}
            onLoad={() => setState('ready')}
            onError={() => setState('failed')}
            style={{ width: inner, height: inner, borderRadius: inner / 2 }}
            resizeMode="cover"
            accessibilityLabel={name}
          />
          {state === 'loading' ? (
            <View style={styles.placeholder} pointerEvents="none">
              <Skeleton width={inner} height={inner} radius={inner / 2} />
            </View>
          ) : null}
        </>
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
  placeholder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
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
