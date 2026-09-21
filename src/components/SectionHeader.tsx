import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { GUTTER, colors, space, type } from '@/theme';

import { TextLink } from './TextLink';

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
        <TextLink
          label={actionLabel}
          accessibilityLabel={`${actionLabel}, ${title}`}
          onPress={onAction}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
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
});
