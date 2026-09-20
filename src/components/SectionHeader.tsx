import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { GUTTER, colors, space, type } from '@/theme';

type SectionHeaderProps = {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
};

/** Section title with an optional link, used above every list on the home tab. */
export function SectionHeader({
  title,
  actionLabel = 'See all',
  onAction,
}: SectionHeaderProps) {
  return (
    <View style={styles.row}>
      <Text style={styles.title}>{title}</Text>

      {onAction ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${actionLabel}, ${title}`}
          onPress={onAction}
          hitSlop={10}
          style={({ pressed }) => pressed && styles.pressed}
        >
          <Text style={styles.action}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    paddingHorizontal: GUTTER,
    marginBottom: space.md,
    gap: space.md,
  },
  title: {
    ...type.section,
    color: colors.ink,
    flexShrink: 1,
  },
  pressed: {
    opacity: 0.5,
  },
  action: {
    ...type.label,
    color: colors.saffronDeep,
  },
});
