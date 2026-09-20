import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ChevronRight } from '@/icons';
import { colors, fontFamily, weight } from '@/theme';

type SectionHeaderProps = {
  title: string;
  /** One line of context under the title — why this section is here. */
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
};

/** Title, optional supporting line and a trailing link, used by every home section. */
export function SectionHeader({
  title,
  subtitle,
  actionLabel = 'View All',
  onAction,
}: SectionHeaderProps) {
  return (
    <View style={styles.row}>
      <View style={styles.titleBlock}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>

      {onAction ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${actionLabel}, ${title}`}
          onPress={onAction}
          hitSlop={10}
          style={({ pressed }) => [styles.action, pressed && styles.actionPressed]}
        >
          <Text style={styles.actionLabel}>{actionLabel}</Text>
          <ChevronRight size={15} color={colors.muted} strokeWidth={2.4} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    marginBottom: 12,
    gap: 12,
  },
  titleBlock: {
    flexShrink: 1,
  },
  title: {
    fontFamily,
    fontSize: 19,
    lineHeight: 24,
    fontWeight: weight.bold,
    letterSpacing: -0.4,
    color: colors.inkStrong,
  },
  subtitle: {
    fontFamily,
    fontSize: 12.5,
    lineHeight: 16,
    color: colors.muted,
    marginTop: 2,
  },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingVertical: 4,
  },
  actionPressed: {
    opacity: 0.55,
  },
  actionLabel: {
    fontFamily,
    fontSize: 13.5,
    fontWeight: weight.medium,
    color: colors.muted,
  },
});
