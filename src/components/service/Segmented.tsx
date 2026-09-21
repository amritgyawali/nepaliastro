import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { GUTTER, colors, radius, space, type } from '@/theme';

type Option<T extends string> = { value: T; label: string };

type SegmentedProps<T extends string> = {
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
  /** Scrolls horizontally instead of splitting the width evenly. */
  scrollable?: boolean;
};

/**
 * The one control for switching between views of the same thing.
 *
 * Fixed width splits evenly for two to four options; anything longer
 * scrolls, because four labels squeezed into a phone width stop being
 * readable and a fifth is unreachable.
 */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
  scrollable,
}: SegmentedProps<T>) {
  const items = options.map((option) => {
    const selected = option.value === value;
    return (
      <Pressable
        key={option.value}
        accessibilityRole="tab"
        accessibilityState={{ selected }}
        accessibilityLabel={option.label}
        onPress={() => onChange(option.value)}
        style={({ pressed }) => [
          styles.item,
          scrollable ? styles.itemScroll : styles.itemFixed,
          selected && styles.itemSelected,
          pressed && styles.pressed,
        ]}
      >
        <Text style={[styles.label, selected && styles.labelSelected]} numberOfLines={1}>
          {option.label}
        </Text>
      </Pressable>
    );
  });

  if (scrollable) {
    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {items}
      </ScrollView>
    );
  }

  return <View style={styles.row}>{items}</View>;
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: space.sm,
    paddingHorizontal: GUTTER,
  },
  scrollContent: {
    flexDirection: 'row',
    gap: space.sm,
    paddingHorizontal: GUTTER,
  },
  item: {
    minHeight: 38,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: space.lg,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
  itemFixed: { flex: 1, paddingHorizontal: space.sm },
  itemScroll: {},
  itemSelected: {
    backgroundColor: colors.saffronSoft,
    borderColor: colors.saffron,
  },
  pressed: { opacity: 0.6 },
  label: { ...type.label, color: colors.muted },
  labelSelected: { color: colors.saffronDeep },
});
