import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';

import type { Speciality } from '@/data/astrologers';
import { directoryFilters } from '@/data/content';
import { GUTTER, colors, font, radius, space, type } from '@/theme';

type FilterChipsProps = {
  value: Speciality;
  onChange: (value: Speciality) => void;
};

/** One row of filters above a directory list: plain words, one of them on. */
export function FilterChips({ value, onChange }: FilterChipsProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
    >
      {directoryFilters.map((filter) => {
        const selected = value === filter.id;

        return (
          <Pressable
            key={filter.id}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            accessibilityLabel={`Show ${filter.label}`}
            onPress={() => onChange(filter.id as Speciality)}
            style={({ pressed }) => [
              styles.chip,
              selected && styles.chipSelected,
              pressed && styles.pressed,
            ]}
          >
            <Text style={[styles.label, selected && styles.labelSelected]}>
              {filter.label}
            </Text>
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
    gap: space.sm,
    paddingHorizontal: GUTTER,
    paddingBottom: space.md,
  },
  chip: {
    paddingHorizontal: space.lg,
    paddingVertical: space.sm + 2,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
  chipSelected: {
    backgroundColor: colors.saffronSoft,
    borderColor: colors.saffron,
  },
  pressed: {
    opacity: 0.6,
  },
  label: {
    ...type.label,
    color: colors.body,
  },
  labelSelected: {
    fontFamily: font.semibold,
    color: colors.saffronDeep,
  },
});
