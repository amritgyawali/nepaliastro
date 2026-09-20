import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { quickCategories } from '@/data/content';
import { BlogReader, Gem, KundliChart, MatchRings, Sunrise } from '@/icons';
import { colors, fontFamily, weight } from '@/theme';

const ICONS = {
  sunrise: Sunrise,
  kundli: KundliChart,
  gem: Gem,
  rings: MatchRings,
  blog: BlogReader,
} as const;

/** Five yellow circles under the home search field. */
export function QuickCategories({ onSelect }: { onSelect?: (id: string) => void }) {
  return (
    <View style={styles.row}>
      {quickCategories.map((category) => {
        const Icon = ICONS[category.icon];
        return (
          <Pressable
            key={category.id}
            accessibilityRole="button"
            accessibilityLabel={category.label.replace('\n', ' ')}
            onPress={() => onSelect?.(category.id)}
            style={({ pressed }) => [styles.item, pressed && styles.pressed]}
          >
            <View style={styles.circle}>
              <Icon size={34} color="#1A1A1A" strokeWidth={1.6} />
            </View>
            <Text style={styles.label}>{category.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 6,
  },
  item: {
    flex: 1,
    alignItems: 'center',
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.96 }],
  },
  circle: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: colors.yellowCategory,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontFamily,
    fontSize: 11.5,
    lineHeight: 14,
    fontWeight: weight.medium,
    textAlign: 'center',
    color: '#42464B',
    marginTop: 7,
  },
});
