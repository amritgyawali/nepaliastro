import React, { useEffect, useState } from 'react';
import { Image, StyleSheet, Text, View, ViewStyle } from 'react-native';

import { KundliChart } from '@/icons';
import { colors, font } from '@/theme';

type AvatarProps = {
  /** A real photograph of the person, used with their consent. */
  uri?: string;
  name: string;
  size: number;
  /**
   * The AI astrologer. He is not a person, so he gets no face and no
   * initials: the kundli square he reads from stands in for both.
   */
  ai?: boolean;
  style?: ViewStyle;
};

type LoadState = 'loading' | 'ready' | 'failed';

/**
 * A round portrait, or the person's initials when there is no photograph.
 *
 * The initials are the default, not a failure state: a listing shows a real
 * photo only when the astrologer has given one, and never a generated face.
 * A slow or dead image URL falls back to them too, so it never leaves a
 * hole in the layout.
 */
export function Avatar({ uri, name, size, ai, style }: AvatarProps) {
  const [state, setState] = useState<LoadState>(uri ? 'loading' : 'failed');

  // A recycled card can be handed a different portrait; start that one over.
  useEffect(() => {
    setState(uri ? 'loading' : 'failed');
  }, [uri]);

  const circle = { width: size, height: size, borderRadius: size / 2 };

  return (
    <View style={[styles.root, circle, style]}>
      <View style={[styles.fallback, circle]}>
        {ai ? (
          <KundliChart size={Math.round(size * 0.46)} color={colors.saffronDeep} strokeWidth={1.6} />
        ) : (
          <Text
            style={[styles.initials, { fontSize: Math.max(12, size * 0.36) }]}
            allowFontScaling={false}
          >
            {initialsOf(name)}
          </Text>
        )}
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

/** "Ji" is how you address someone, not part of their name. */
const HONORIFICS = new Set(['ji']);

function initialsOf(name: string): string {
  const parts = name.split(/\s+/).filter(Boolean);
  const named = parts.filter((part) => !HONORIFICS.has(part.toLowerCase()));
  return (named.length ? named : parts)
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
    borderWidth: 1,
    borderColor: colors.saffronBorder,
  },
  initials: {
    fontFamily: font.semibold,
    color: colors.saffronDeep,
  },
});
