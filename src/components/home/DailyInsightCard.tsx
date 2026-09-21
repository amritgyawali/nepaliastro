import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { RASHIS, type Rashifal } from '@/lib/jyotish';
import { GUTTER, colors, radius, space, type } from '@/theme';

type DailyInsightCardProps = {
  reading: Rashifal;
  /** "Sun 20 Sep", shown next to the sign name. */
  dateLabel: string;
  /** Opens the full horoscope screen, where every sign is readable. */
  onOpen?: () => void;
};

/**
 * Today's reading.
 *
 * The card used to carry three animated bars scoring love, career and health
 * out of a hundred. They were invented numbers wearing the clothes of data,
 * so they are gone: what is left is the sign, the day's line, and the two
 * details people actually repeat — the lucky number and colour.
 *
 * The line itself is now derived from where the grahas stand today, counted
 * from this sign, rather than drawn from a list of headlines.
 */
export function DailyInsightCard({ reading, dateLabel, onOpen }: DailyInsightCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <View style={styles.card}>
      <View style={styles.head}>
        <View style={styles.glyphTile}>
          {/*
            U+FE0E keeps the sign as a text glyph. Without it the browser and
            some Android builds swap in the colour emoji, which ignores the
            ink colour set here.
          */}
          <Text style={styles.glyph} allowFontScaling={false}>
            {`${reading.glyph}︎`}
          </Text>
        </View>

        <View style={styles.identity}>
          <Text style={styles.signName} numberOfLines={1}>
            {reading.rashi}
          </Text>
          <Text style={styles.dateLine} numberOfLines={1}>
            {dateLabel} · {RASHIS[reading.index].element} sign
          </Text>
        </View>
      </View>

      <Text style={styles.headline}>{reading.headline}</Text>

      <Text style={styles.body} numberOfLines={expanded ? undefined : 2}>
        {reading.sections.map((section) => section.body).join(' ')}
      </Text>

      <View style={styles.links}>
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ expanded }}
          accessibilityLabel={expanded ? 'Show less of today’s reading' : 'Read all of today’s reading'}
          onPress={() => setExpanded((current) => !current)}
          hitSlop={8}
          style={({ pressed }) => [styles.more, pressed && styles.pressed]}
        >
          <Text style={styles.moreLabel}>{expanded ? 'Show less' : 'Read more'}</Text>
        </Pressable>

        {onOpen ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Open the daily horoscope"
            onPress={onOpen}
            hitSlop={8}
            style={({ pressed }) => [styles.more, pressed && styles.pressed]}
          >
            <Text style={styles.moreLabel}>All signs</Text>
          </Pressable>
        ) : null}
      </View>

      <View style={styles.lucky}>
        <View style={styles.luckyItem}>
          <Text style={styles.luckyLabel}>Lucky number</Text>
          <Text style={styles.luckyValue}>{reading.luckyNumbers.join(', ')}</Text>
        </View>

        <View style={styles.luckyDivider} />

        <View style={styles.luckyItem}>
          <Text style={styles.luckyLabel}>Lucky colour</Text>
          <View style={styles.luckyColourRow}>
            <View style={[styles.swatch, { backgroundColor: reading.luckySwatch[0] }]} />
            <Text style={styles.luckyValue}>{reading.luckyColours[0]}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: GUTTER,
    padding: space.lg,
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  head: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
  },
  glyphTile: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.saffronSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glyph: {
    fontSize: 22,
    lineHeight: 28,
    color: colors.saffronDeep,
  },
  identity: {
    flex: 1,
  },
  signName: {
    ...type.section,
    color: colors.ink,
  },
  dateLine: {
    ...type.small,
    color: colors.muted,
  },
  headline: {
    ...type.title,
    color: colors.ink,
    marginTop: space.lg,
  },
  body: {
    ...type.body,
    color: colors.body,
    marginTop: space.sm,
  },
  links: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.lg,
  },
  more: {
    paddingVertical: space.sm,
  },
  pressed: {
    opacity: 0.5,
  },
  moreLabel: {
    ...type.label,
    color: colors.saffronDeep,
  },
  lucky: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: space.sm,
    paddingTop: space.md,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  luckyItem: {
    flex: 1,
    gap: 2,
  },
  luckyDivider: {
    width: 1,
    alignSelf: 'stretch',
    marginHorizontal: space.md,
    backgroundColor: colors.divider,
  },
  luckyLabel: {
    ...type.caption,
    color: colors.muted,
  },
  luckyValue: {
    ...type.label,
    color: colors.ink,
  },
  luckyColourRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
  },
  swatch: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: colors.hairline,
  },
});
