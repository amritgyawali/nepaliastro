import React from 'react';
import { Image, StyleSheet, Text, View, type ImageStyle, type StyleProp } from 'react-native';

import type { Scene } from '@/data/images';
import { colors, radius, type } from '@/theme';

type PhotoProps = {
  scene: Scene;
  /** Height of the frame; the photograph is cropped to fill it. */
  height: number;
  /** Prints the photographer and licence under the frame. */
  credited?: boolean;
  style?: StyleProp<ImageStyle>;
};

/**
 * A bundled photograph in a rounded frame.
 *
 * The credit sits under the photo in small type, the way a newspaper prints
 * it, rather than over the image: it stays legible on any photo and never
 * covers the part someone is looking at.
 */
export function Photo({ scene, height, credited, style }: PhotoProps) {
  return (
    <View>
      <Image
        source={scene.source}
        style={[styles.image, { height }, style]}
        resizeMode="cover"
        accessible
        accessibilityRole="image"
        accessibilityLabel={scene.alt}
      />
      {credited ? (
        <Text style={styles.credit} numberOfLines={1}>
          Photo: {scene.credit}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  image: {
    width: '100%',
    borderRadius: radius.lg,
    backgroundColor: colors.fill,
  },
  credit: {
    ...type.caption,
    color: colors.subtle,
    marginTop: 6,
    textAlign: 'right',
  },
});
