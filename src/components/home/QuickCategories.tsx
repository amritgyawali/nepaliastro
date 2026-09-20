import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { quickCategories } from '@/data/content';
import { BlogReader, Gem, KundliChart, MatchRings, Sunrise } from '@/icons';
import { colors, fontFamily, weight } from '@/theme';

import { PressableScale } from '../PressableScale';

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
        const label = category.label.replace('\n', ' ');

        return (
          <PressableScale
            key={category.id}
            accessibilityRole="button"
            accessibilityLabel={label}
            onPress={() => onSelect?.(category.id)}
            scaleTo={0.92}
            containerStyle={styles.item}
            style={styles.itemInner}
          >
            <View style={styles.circle}>
              <Icon size={34} color="#1A1A1A" strokeWidth={1.6} />
            </View>
            <Text style={styles.label} numberOfLines={2}>
              {category.label}
            </Text>
          </PressableScale>
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
  },
  itemInner: {
    alignItems: 'center',
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
