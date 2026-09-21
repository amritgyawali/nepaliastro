import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { quickCategories } from '@/data/content';
import { Clock, Grid, KundliChart, Star } from '@/icons';
import { GUTTER, colors, radius, space, type } from '@/theme';
import { Tappable } from '../Tappable';

const ICONS = {
  star: Star,
  grid: Grid,
  clock: Clock,
  kundli: KundliChart,
} as const;

/** Four shortcuts under the search field — the things people open first. */
export function QuickCategories({ onSelect }: { onSelect?: (id: string) => void }) {
  return (
    <View style={styles.row}>
      {quickCategories.map((category) => {
        const Icon = ICONS[category.icon];

        return (
          <Tappable
            key={category.id}
            accessibilityRole="button"
            accessibilityLabel={category.label}
            onPress={() => onSelect?.(category.id)}
            style={styles.item}
            pressedStyle={styles.pressed}
          >
            <View style={styles.tile}>
              <Icon size={26} color={colors.saffronDeep} strokeWidth={1.8} />
            </View>
            <Text style={styles.label} numberOfLines={1}>
              {category.label}
            </Text>
          </Tappable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    paddingHorizontal: GUTTER - space.sm,
    paddingTop: space.xs,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    gap: space.sm,
    paddingVertical: space.sm,
  },
  pressed: {
    opacity: 0.6,
  },
  tile: {
    width: 56,
    height: 56,
    borderRadius: radius.lg,
    backgroundColor: colors.saffronSoft,
    borderWidth: 1,
    borderColor: colors.saffronBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    ...type.caption,
    color: colors.body,
    textAlign: 'center',
  },
});
