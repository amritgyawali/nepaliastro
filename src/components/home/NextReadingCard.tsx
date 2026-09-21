import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import type { Prediction } from '@/lib/predictions';
import { formatCountdown, formatSlotTime } from '@/lib/predictions';
import { GUTTER, colors, radius, space, type } from '@/theme';

import { Tappable } from '../Tappable';
import { TextLink } from '../TextLink';

type NextReadingCardProps = {
  /** The reading for the window the person is in now. */
  reading: Prediction;
  /** The one after it, if it has been written yet. */
  next?: Prediction;
  now: Date;
  onOpen: () => void;
  onSeeAll: () => void;
};

/**
 * The five-hourly reading, on the home screen.
 *
 * The same text the notification carries, so someone who missed the alert —
 * or turned them off — still finds today's reading where they are looking.
 */
export function NextReadingCard({
  reading,
  next,
  now,
  onOpen,
  onSeeAll,
}: NextReadingCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.head}>
        <Text style={styles.label}>{reading.phaseLabel} reading</Text>
        {next ? (
          <Text style={styles.next}>
            next {formatCountdown(now, new Date(next.at))}
          </Text>
        ) : null}
      </View>

      <Tappable
        accessibilityRole="button"
        accessibilityLabel={`Open your reading: ${reading.title}`}
        onPress={onOpen}
        feel="card"
      >
        <Text style={styles.title}>{reading.title}</Text>
        <Text style={styles.body} numberOfLines={3}>
          {reading.preview}
        </Text>
      </Tappable>

      <View style={styles.foot}>
        <Text style={styles.focus} numberOfLines={1}>
          {reading.focus}
        </Text>

        <TextLink
          label={next ? `All readings · ${formatSlotTime(new Date(next.at))}` : 'All readings'}
          accessibilityLabel="See all of your readings"
          onPress={onSeeAll}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: GUTTER,
    padding: space.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.saffronSoft,
    borderWidth: 1,
    borderColor: colors.saffronBorder,
  },
  head: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: space.sm,
  },
  label: {
    ...type.caption,
    color: colors.saffronDeep,
  },
  next: {
    ...type.caption,
    color: colors.muted,
  },
  title: {
    ...type.section,
    color: colors.ink,
    marginTop: space.xs,
  },
  body: {
    ...type.body,
    color: colors.body,
    marginTop: space.xs,
  },
  foot: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: space.md,
    marginTop: space.md,
    paddingTop: space.md,
    borderTopWidth: 1,
    borderTopColor: colors.saffronBorder,
  },
  focus: {
    ...type.caption,
    color: colors.muted,
    flexShrink: 1,
  },
});
