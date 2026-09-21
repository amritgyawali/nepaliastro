import React from 'react';
import { StyleSheet, Text, View, type ViewStyle } from 'react-native';

import { colors, radius, space, type } from '@/theme';

type CardProps = {
  children: React.ReactNode;
  /** Optional heading inside the card. */
  title?: string;
  /** One quiet line under the title. */
  subtitle?: string;
  /** Tints the card saffron — for the one thing on a screen that matters most. */
  accent?: boolean;
  padded?: boolean;
  style?: ViewStyle;
};

/**
 * The surface every reading sits on.
 *
 * A border rather than a shadow: a page of eight cards with eight shadows
 * reads as noise, and the border keeps the whole app on one plane.
 */
export function Card({ children, title, subtitle, accent, padded = true, style }: CardProps) {
  return (
    <View style={[styles.card, accent && styles.accent, padded && styles.padded, style]}>
      {title ? <Text style={styles.title}>{title}</Text> : null}
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    overflow: 'hidden',
  },
  accent: {
    backgroundColor: colors.saffronSoft,
    borderColor: colors.saffronBorder,
  },
  padded: {
    padding: space.lg,
  },
  title: {
    ...type.section,
    color: colors.ink,
  },
  subtitle: {
    ...type.small,
    color: colors.muted,
    marginTop: 2,
    marginBottom: space.sm,
  },
});
