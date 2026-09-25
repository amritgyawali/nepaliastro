import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { festivalScene } from '@/data/images';
import {
  festivalsIn, festivalsInIfKnown, formatBsNepali, formatClock, formatShortDay, nepaliClock,
  startOfNepaliDay, type Festival,
} from '@/lib/jyotish';
import { GUTTER, colors, motion, radius, space, type } from '@/theme';

import { untilLabel } from '../FestivalDate';
import { Photo } from '../Photo';
import { SectionHeader } from '../SectionHeader';
import { Tappable } from '../Tappable';

/** The next festival and the one after it. */
const SHOWN = 2;

/**
 * Wait for the home screen's sections to settle in before working out the
 * festival year: it takes a moment, and nothing above the fold waits on it.
 */
const SETTLE_MS = motion.reveal.maxDelay + motion.reveal.duration;

function upcoming(now: Date, lookup: (year: number) => readonly Festival[] | undefined) {
  const today = startOfNepaliDay(now);
  const { year } = nepaliClock(now);
  const found: Festival[] = [];
  // Late in December the next festival is already in next year's list.
  for (const y of [year, year + 1]) {
    const festivals = lookup(y);
    if (!festivals) return null;
    found.push(...festivals.filter((festival) => festival.date >= today));
    if (found.length >= SHOWN) break;
  }
  return found.slice(0, SHOWN);
}

/**
 * The festivals coming up, or `null` while they are still being worked out.
 * A year already found (on the patro, say) is used straight away.
 */
export function useUpcomingFestivals(now: Date): Festival[] | null {
  const dayKey = startOfNepaliDay(now).getTime();
  const known = useMemo(() => upcoming(now, festivalsInIfKnown), [dayKey]);
  const [found, setFound] = useState<{ day: number; list: Festival[] } | null>(null);

  useEffect(() => {
    if (known) return;
    const timer = setTimeout(() => {
      const list = upcoming(now, (year) => festivalsIn(year));
      if (list) setFound({ day: dayKey, list });
    }, SETTLE_MS);
    return () => clearTimeout(timer);
  }, [dayKey, known]);

  return known ?? (found?.day === dayKey ? found.list : null);
}

type NextFestivalCardProps = {
  title: string;
  festivals: Festival[];
  now: Date;
  onOpen: () => void;
};

/**
 * The next festival, with a photograph of it being kept.
 *
 * Dashain, Tihar and the rest are what most people open a patro for, so the
 * home screen says which one is next, how far off it is, and — for the two
 * days that have one — the tika sait.
 */
export function NextFestivalCard({ title, festivals, now, onOpen }: NextFestivalCardProps) {
  const [next, then] = festivals;
  if (!next) return null;
  const scene = festivalScene(next.id);
  const when = untilLabel(next.date, now);

  return (
    <View style={styles.section}>
      <SectionHeader title={title} actionLabel="All festivals" onAction={onOpen} />

      <Tappable
        feel="card"
        accessibilityRole="button"
        accessibilityLabel={`${next.name}, ${when.toLowerCase()}. ${next.about}`}
        onPress={onOpen}
        style={styles.card}
        hoveredStyle={styles.cardHovered}
      >
        {scene ? <Photo scene={scene} height={172} credited style={styles.photo} /> : null}

        <View style={[styles.body, scene && styles.bodyUnderPhoto]}>
          <Text style={styles.when}>
            {when} · {formatShortDay(next.date)}
          </Text>
          <Text style={styles.name}>
            {next.name} <Text style={styles.np}>{next.np}</Text>
          </Text>
          {next.bs ? <Text style={styles.bs}>{formatBsNepali(next.bs)}</Text> : null}
          <Text style={styles.about}>{next.about}</Text>
          {next.sait ? (
            <Text style={styles.sait}>
              Tika sait {formatClock(next.sait.from)} – {formatClock(next.sait.to)}
            </Text>
          ) : null}
        </View>

        {then ? (
          <View style={styles.then}>
            <Text style={styles.thenLabel}>Then</Text>
            <Text style={styles.thenName} numberOfLines={1}>
              {then.name}
            </Text>
            <Text style={styles.thenDate}>{formatShortDay(then.date)}</Text>
          </View>
        ) : null}
      </Tappable>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginTop: space.xl,
  },
  card: {
    marginHorizontal: GUTTER,
    padding: space.md,
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardHovered: {
    borderColor: colors.saffronBorder,
  },
  photo: {
    borderRadius: radius.md,
  },
  body: {
    paddingHorizontal: space.xs,
    gap: 2,
  },
  bodyUnderPhoto: {
    marginTop: space.xs,
  },
  when: {
    ...type.caption,
    color: colors.saffronDeep,
  },
  name: {
    ...type.title,
    color: colors.ink,
  },
  np: {
    ...type.section,
    color: colors.saffronDeep,
  },
  bs: {
    ...type.small,
    color: colors.body,
  },
  about: {
    ...type.small,
    color: colors.muted,
    marginTop: space.xs,
  },
  sait: {
    ...type.label,
    color: colors.saffronDeep,
    marginTop: space.sm,
  },
  then: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: space.sm,
    marginTop: space.md,
    paddingTop: space.md,
    paddingHorizontal: space.xs,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  thenLabel: {
    ...type.caption,
    color: colors.muted,
  },
  thenName: {
    ...type.label,
    color: colors.ink,
    flexShrink: 1,
  },
  thenDate: {
    ...type.caption,
    color: colors.muted,
    marginLeft: 'auto',
  },
});
