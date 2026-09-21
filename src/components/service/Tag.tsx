import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors, radius, space, type } from '@/theme';

type TagProps = {
  label: string;
  tone?: 'neutral' | 'good' | 'bad' | 'accent';
};

/** A small status word — a verdict, a severity, a quality. */
export function Tag({ label, tone = 'neutral' }: TagProps) {
  return (
    <View style={[styles.tag, styles[tone]]}>
      <Text style={[styles.label, styles[`${tone}Text`]]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tag: {
    alignSelf: 'flex-start',
    paddingHorizontal: space.md,
    paddingVertical: 3,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  label: { ...type.caption },
  neutral: { backgroundColor: colors.fill, borderColor: colors.border },
  neutralText: { color: colors.body },
  good: { backgroundColor: colors.greenSoft, borderColor: colors.greenSoft },
  goodText: { color: colors.green },
  bad: { backgroundColor: colors.redSoft, borderColor: colors.redSoft },
  badText: { color: colors.red },
  accent: { backgroundColor: colors.saffronSoft, borderColor: colors.saffronBorder },
  accentText: { color: colors.saffronDeep },
});
