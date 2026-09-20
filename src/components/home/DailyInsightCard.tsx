import React, { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';

import { ChevronRight } from '@/icons';
import type { DailyReading } from '@/lib/astro';
import {
  colors,
  duration,
  easing,
  fontFamily,
  radius,
  shadow,
  weight,
} from '@/theme';

import { useReduceMotion } from '@/hooks/useReduceMotion';

type DailyInsightCardProps = {
  reading: DailyReading;
  /** "Sun 20 Sep", shown next to the sign name. */
  dateLabel: string;
};

/**
 * The personalised card at the top of the feed.
 *
 * It is a plain View rather than a Pressable: the "Read more" control is its
 * own button, and nesting pressables would emit nested <button> elements on
 * web. The three meters fill on mount so the numbers are read as a
 * comparison rather than as three unrelated figures.
 */
export function DailyInsightCard({ reading, dateLabel }: DailyInsightCardProps) {
  const reduceMotion = useReduceMotion();
  const [expanded, setExpanded] = useState(false);

  // One driver per meter so they can be staggered.
  const fills = useRef(reading.aspects.map(() => new Animated.Value(0))).current;
  const scores = reading.aspects.map((aspect) => aspect.score).join(',');

  useEffect(() => {
    if (reduceMotion) {
      fills.forEach((fill) => fill.setValue(1));
      return;
    }

    fills.forEach((fill) => fill.setValue(0));
    const animation = Animated.stagger(
      70,
      fills.map((fill) =>
        Animated.timing(fill, {
          toValue: 1,
          duration: duration.base,
          easing: easing.decelerate,
          // Width is a layout property, so this one cannot go on the native
          // driver; it is three short tweens and nothing else competes.
          useNativeDriver: false,
        }),
      ),
    );
    animation.start();
    return () => animation.stop();
  }, [fills, reduceMotion, scores]);

  return (
    <View style={styles.card}>
      <View style={styles.top}>
        <View style={styles.glyphCircle}>
          {/*
            U+FE0E keeps the sign as a text glyph. Without it the browser and
            some Android builds swap in the colour emoji, which ignores the
            ink colour and sits oddly against the yellow.
          */}
          <Text style={styles.glyph} allowFontScaling={false}>
            {`${reading.sign.glyph}\uFE0E`}
          </Text>
        </View>

        <View style={styles.identity}>
          <Text style={styles.signName} numberOfLines={1}>
            {reading.sign.name}
          </Text>
          <Text style={styles.dateLine} numberOfLines={1}>
            {dateLabel} · {reading.sign.element} sign
          </Text>
        </View>

        <View style={styles.moodChip}>
          <Text style={styles.moodLabel}>{reading.mood}</Text>
        </View>
      </View>

      <Text style={styles.headline}>{reading.headline}</Text>

      <View
        style={styles.meters}
        accessible
        accessibilityLabel={reading.aspects
          .map((aspect) => `${aspect.label} ${aspect.score} out of 100`)
          .join(', ')}
      >
        {reading.aspects.map((aspect, index) => (
          <View key={aspect.id} style={styles.meterRow}>
            <Text style={styles.meterLabel}>{aspect.label}</Text>
            <View style={styles.track}>
              <Animated.View
                style={[
                  styles.fill,
                  {
                    width: fills[index].interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0%', `${aspect.score}%`],
                    }),
                  },
                ]}
              />
            </View>
            <Text style={styles.meterValue}>{aspect.score}</Text>
          </View>
        ))}
      </View>

      <Text style={styles.body} numberOfLines={expanded ? undefined : 2}>
        {reading.body}
      </Text>

      <View style={styles.footer}>
        <View style={styles.chips}>
          <View style={styles.chip}>
            <View
              style={[styles.swatch, { backgroundColor: reading.luckyColour.hex }]}
            />
            <Text style={styles.chipLabel}>{reading.luckyColour.name}</Text>
          </View>
          <View style={styles.chip}>
            <Text style={styles.chipLabel}>Lucky {reading.luckyNumber}</Text>
          </View>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityState={{ expanded }}
          accessibilityLabel={expanded ? 'Show less of today’s reading' : 'Read more of today’s reading'}
          onPress={() => setExpanded((current) => !current)}
          hitSlop={10}
          style={({ pressed }) => [styles.more, pressed && styles.morePressed]}
        >
          <Text style={styles.moreLabel}>{expanded ? 'Less' : 'Read more'}</Text>
          <View style={expanded ? styles.chevronUp : styles.chevronDown}>
            <ChevronRight size={14} color={colors.muted} strokeWidth={2.4} />
          </View>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 14,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 12,
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    ...shadow(3, 0.06, 14),
  },
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  glyphCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: colors.yellowCategory,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glyph: {
    fontFamily,
    fontSize: 24,
    lineHeight: 30,
    color: '#1A1A1A',
  },
  identity: {
    flex: 1,
  },
  signName: {
    fontFamily,
    fontSize: 16,
    lineHeight: 20,
    fontWeight: weight.bold,
    letterSpacing: -0.3,
    color: colors.inkStrong,
  },
  dateLine: {
    fontFamily,
    fontSize: 12.5,
    lineHeight: 16,
    color: colors.muted,
    marginTop: 1,
  },
  moodChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.pill,
    backgroundColor: colors.yellowSoft,
  },
  moodLabel: {
    fontFamily,
    fontSize: 11.5,
    fontWeight: weight.semibold,
    letterSpacing: 0.1,
    color: '#8A7233',
  },
  headline: {
    fontFamily,
    fontSize: 17,
    lineHeight: 23,
    fontWeight: weight.semibold,
    letterSpacing: -0.3,
    color: colors.inkStrong,
    marginTop: 13,
  },
  meters: {
    marginTop: 12,
    gap: 8,
  },
  meterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  meterLabel: {
    fontFamily,
    fontSize: 12.5,
    fontWeight: weight.medium,
    color: '#5C6066',
    width: 52,
  },
  track: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.divider,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 3,
    backgroundColor: colors.yellow,
  },
  meterValue: {
    fontFamily,
    fontSize: 12.5,
    fontWeight: weight.semibold,
    color: colors.inkStrong,
    width: 24,
    textAlign: 'right',
  },
  body: {
    fontFamily,
    fontSize: 13.5,
    lineHeight: 19,
    color: '#5C6066',
    marginTop: 13,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    gap: 10,
  },
  chips: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexShrink: 1,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.pill,
    backgroundColor: colors.sheet,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  swatch: {
    width: 11,
    height: 11,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.hairline,
  },
  chipLabel: {
    fontFamily,
    fontSize: 12,
    fontWeight: weight.medium,
    color: '#4B4F55',
  },
  more: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingVertical: 4,
  },
  morePressed: {
    opacity: 0.55,
  },
  moreLabel: {
    fontFamily,
    fontSize: 13,
    fontWeight: weight.medium,
    color: colors.muted,
  },
  chevronDown: {
    transform: [{ rotate: '90deg' }],
  },
  chevronUp: {
    transform: [{ rotate: '-90deg' }],
  },
});
