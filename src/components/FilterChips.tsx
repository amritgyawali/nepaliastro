import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import type { Speciality } from '@/data/astrologers';
import { directoryFilters } from '@/data/content';
import { GridOutline, GridSquares, PalmHand, Sliders, TarotCards } from '@/icons';
import { colors, fontFamily, radius, weight } from '@/theme';

type ChipIcon = React.ComponentType<{ size?: number; color?: string }>;

/**
 * Glyph and accent per chip. "All" is the only one that swaps between a
 * filled and an outline mark depending on selection, as in the designs.
 */
const CHIP_ICONS: Record<string, { idle: ChipIcon; active: ChipIcon; color: string }> = {
  all: { idle: GridOutline, active: GridSquares, color: '#EFC72A' },
  tarot: { idle: TarotCards, active: TarotCards, color: '#A855F7' },
  palmistry: { idle: PalmHand, active: PalmHand, color: '#9B7BE0' },
};

type FilterChipsProps = {
  value: Speciality;
  onChange: (value: Speciality) => void;
  onFilterPress?: () => void;
};

/** Horizontal Filter / All / Tarot / Palmistry row above each directory list. */
export function FilterChips({ value, onChange, onFilterPress }: FilterChipsProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
    >
      <Pressable
        accessibilityRole="button"
        onPress={onFilterPress}
        style={({ pressed }) => [styles.chip, pressed && styles.pressed]}
      >
        <Sliders size={17} color="#5F6368" />
        <Text style={styles.label}>Filter</Text>
      </Pressable>

      <View style={styles.separator} />

      {directoryFilters.map((filter) => {
        const selected = value === filter.id;
        const meta = CHIP_ICONS[filter.id];
        const Icon = selected ? meta.active : meta.idle;

        return (
          <Pressable
            key={filter.id}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            onPress={() => onChange(filter.id as Speciality)}
            style={({ pressed }) => [
              styles.chip,
              selected && styles.chipSelected,
              pressed && styles.pressed,
            ]}
          >
            <Icon size={17} color={meta.color} />
            <Text style={[styles.label, selected && styles.labelSelected]}>{filter.label}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    paddingHorizontal: 14,
    paddingVertical: 4,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.chipBorder,
    backgroundColor: colors.white,
  },
  chipSelected: {
    borderWidth: 2,
    borderColor: '#EFD140',
    backgroundColor: '#FFFEF8',
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  pressed: {
    opacity: 0.7,
  },
  separator: {
    width: 1,
    height: 26,
    backgroundColor: colors.chipBorder,
  },
  label: {
    fontFamily,
    fontSize: 14.5,
    fontWeight: weight.medium,
    color: '#3F4348',
  },
  labelSelected: {
    fontWeight: weight.bold,
    color: colors.inkStrong,
  },
});
