import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Card, NavHeader, Photo, Reveal, Screen, Segmented } from '@/components';
import { DateLeaf, untilLabel } from '@/components/FestivalDate';
import { festivalScene, type Scene } from '@/data/images';
import {
  VARA, festivalsIn, formatBsNepali, formatClock, formatGregorian, nepaliClock, startOfNepaliDay,
  type Festival,
} from '@/lib/jyotish';
import { GUTTER, colors, radius, space, type } from '@/theme';

type Group = { title: string; festivals: readonly Festival[]; past: boolean };

/**
 * The festival year.
 *
 * Nepali festivals are fixed to tithis, not dates, so they move by up to
 * three weeks between years — a hardcoded list is stale the day it ships.
 * Every date here is found by searching the real lunation for the tithi the
 * festival is kept on.
 *
 * The screen opens on what is next, then what follows it; the ones already
 * kept this year sit below, dimmed, for anyone looking one up.
 */
export default function FestivalsScreen() {
  const now = useMemo(() => new Date(), []);
  const today = useMemo(() => startOfNepaliDay(now), [now]);
  const thisYear = nepaliClock(now).year;
  const [year, setYear] = useState(thisYear);

  const festivals = useMemo(() => festivalsIn(year), [year]);
  const isThisYear = year === thisYear;
  const upcoming = festivals.filter((f) => f.date >= today);
  const next = isThisYear ? upcoming[0] : undefined;
  const nextScene = next ? festivalScene(next.id) : undefined;

  const groups: Group[] = isThisYear
    ? [
        { title: next ? 'After that' : 'Still to come', festivals: next ? upcoming.slice(1) : upcoming, past: false },
        { title: 'Already kept this year', festivals: festivals.filter((f) => f.date < today), past: true },
      ]
    : [{ title: `All of ${year}`, festivals, past: year < thisYear }];

  return (
    <Screen>
      <NavHeader title="Festivals" bordered />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {next ? (
          <Reveal>
            <Card accent style={styles.card}>
              {nextScene ? (
                <View style={styles.nextPhoto}>
                  <Photo scene={nextScene} height={176} credited style={styles.nextImage} />
                </View>
              ) : null}
              <Text style={styles.nextLabel}>{untilLabel(next.date, now)}</Text>
              <Text style={styles.nextName}>
                {next.name} <Text style={styles.nextNp}>{next.np}</Text>
              </Text>
              <Text style={styles.nextDate}>
                {formatGregorian(next.date)}
                {next.bs ? ` · ${formatBsNepali(next.bs)}` : ''}
              </Text>
              <Text style={styles.nextAbout}>{next.about}</Text>
              {next.sait ? (
                <Text style={styles.sait}>
                  Tika sait {formatClock(next.sait.from)} – {formatClock(next.sait.to)}
                </Text>
              ) : null}
            </Card>
          </Reveal>
        ) : null}

        <View style={styles.segmented}>
          <Segmented
            value={`${year}`}
            onChange={(v) => setYear(Number(v))}
            options={[thisYear - 1, thisYear, thisYear + 1].map((y) => ({ value: `${y}`, label: `${y}` }))}
          />
        </View>

        {groups
          .filter((group) => group.festivals.length)
          .map((group, index) => (
            <Reveal key={`${year}-${group.title}`} index={index + 1} style={styles.group}>
              <Text style={styles.groupTitle}>{group.title}</Text>
              <Card padded={false}>
                {withFirstPhotos(group.festivals, group.past ? undefined : nextScene).map(
                  ({ festival, scene }, row) => (
                    <FestivalRow
                      key={festival.id}
                      festival={festival}
                      scene={scene}
                      past={group.past}
                      first={row === 0}
                    />
                  ),
                )}
              </Card>
            </Reveal>
          ))}

        <Text style={styles.footnote}>
          Each date is found by searching for the tithi the festival is kept on, in the
          lunar month it belongs to. In a year with an adhik masa — a repeated lunar
          month — the first occurrence is taken, and those years are worth checking with
          an astrologer.
        </Text>
      </ScrollView>
    </Screen>
  );
}

/**
 * Pairs each festival with its photograph, but only the first time that
 * photograph comes up: the days of Dashain share one, and six copies of it in
 * a row would say less than one. A photo already shown above is not repeated.
 */
function withFirstPhotos(festivals: readonly Festival[], alreadyShown?: Scene) {
  const seen = new Set<Scene>(alreadyShown ? [alreadyShown] : []);
  return festivals.map((festival) => {
    const scene = festivalScene(festival.id);
    if (!scene || seen.has(scene)) return { festival, scene: undefined };
    seen.add(scene);
    return { festival, scene };
  });
}

type FestivalRowProps = {
  festival: Festival;
  scene?: Scene;
  past: boolean;
  first: boolean;
};

function FestivalRow({ festival, scene, past, first }: FestivalRowProps) {
  const weekday = VARA[nepaliClock(festival.date).weekday].en;
  const bs = festival.bs ? `${festival.bs.day} ${festival.bs.monthName}` : null;

  return (
    <View style={[styles.row, !first && styles.rowDivided]}>
      <DateLeaf date={festival.date} past={past} />

      <View style={styles.rowText}>
        <Text style={[styles.name, past && styles.past]}>
          {festival.name} <Text style={styles.np}>{festival.np}</Text>
        </Text>
        <Text style={[styles.meta, past && styles.past]}>
          {[weekday, bs, festival.holiday ? 'Public holiday' : null].filter(Boolean).join(' · ')}
        </Text>
        <Text style={styles.about}>{festival.about}</Text>

        {festival.sait ? (
          <View style={styles.saitBlock}>
            <Text style={[styles.saitTime, past && styles.past]}>
              Tika sait {formatClock(festival.sait.from)} – {formatClock(festival.sait.to)}
            </Text>
            <Text style={styles.saitNote}>{festival.saitNote}</Text>
          </View>
        ) : null}
      </View>

      {scene && !past ? <Photo scene={scene} height={64} style={styles.thumb} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: space.lg, paddingBottom: space.xxl },
  card: { marginHorizontal: GUTTER },
  nextPhoto: { marginBottom: space.md },
  nextImage: { borderRadius: radius.md },
  segmented: { marginTop: space.lg },
  nextLabel: { ...type.caption, color: colors.saffronDeep, textTransform: 'uppercase', letterSpacing: 0.6 },
  nextName: { ...type.display, color: colors.ink },
  nextNp: { ...type.title, color: colors.saffronDeep },
  nextDate: { ...type.body, color: colors.body },
  nextAbout: { ...type.small, color: colors.muted, marginTop: space.xs },
  sait: { ...type.label, color: colors.saffronDeep, marginTop: space.sm },
  group: { marginTop: space.xl, paddingHorizontal: GUTTER },
  groupTitle: { ...type.section, color: colors.ink, marginBottom: space.md },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: space.md,
    padding: space.lg,
  },
  rowDivided: { borderTopWidth: 1, borderTopColor: colors.divider },
  rowText: { flex: 1 },
  name: { ...type.label, color: colors.ink },
  np: { ...type.small, color: colors.muted },
  meta: { ...type.caption, color: colors.saffronDeep },
  past: { color: colors.subtle },
  about: { ...type.small, color: colors.muted, marginTop: space.xs },
  thumb: { width: 64, borderRadius: radius.md },
  saitBlock: { marginTop: space.sm, gap: 2 },
  saitTime: { ...type.label, color: colors.ink },
  saitNote: { ...type.caption, color: colors.muted },
  footnote: { ...type.small, color: colors.subtle, paddingHorizontal: GUTTER, marginTop: space.xl },
});
