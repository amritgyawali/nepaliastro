import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Card, NavHeader, Screen, Tag, Tappable, TextLink } from '@/components';
import { ChevronLeft, ChevronRight } from '@/icons';
import {
  BS_MAX_YEAR, BS_MIN_YEAR, BS_MONTHS, BS_MONTHS_NP, bsMonthGrid, devanagariNumber,
  festivalsIn, formatClock, formatGregorian, isSameNepaliDay, nepaliClock,
  panchangFor, shiftBsMonth, toBs,
} from '@/lib/jyotish';
import { GUTTER, colors, radius, space, type } from '@/theme';

const WEEKDAY_SHORT = ['आइत', 'सोम', 'मंगल', 'बुध', 'बिही', 'शुक्र', 'शनि'];

/**
 * The Nepali patro.
 *
 * A month at a time, in Bikram Sambat, with the Gregorian date small in each
 * cell — which is how a paper patro is laid out and how anyone in Nepal
 * reads one. Saturday is the red column, not Sunday: Nepal's week ends on
 * Saturday.
 */
export default function PatroScreen() {
  const router = useRouter();
  const today = useMemo(() => new Date(), []);
  const todayBs = useMemo(() => toBs(today), [today]);

  const [month, setMonth] = useState(() => ({
    year: todayBs?.year ?? 2082,
    month: todayBs?.month ?? 1,
  }));
  const [selected, setSelected] = useState<Date>(today);

  const days = useMemo(
    () => bsMonthGrid(month.year, month.month, today),
    [month.year, month.month, today],
  );

  // Festivals are found per Gregorian year, so a Bikram month spanning the
  // turn of the year needs both.
  const festivals = useMemo(() => {
    const years = new Set(days.map((d) => nepaliClock(d.gregorian).year));
    return [...years].flatMap((year) => festivalsIn(year));
  }, [days]);

  // Compared as Nepal days, not as the device's: a festival stored at Nepal
  // midnight is still the previous date for a phone set to UTC or later.
  const festivalOn = (date: Date) =>
    festivals.find((f) => isSameNepaliDay(f.date, date));

  const selectedPanchang = useMemo(() => panchangFor(selected), [selected]);
  const selectedFestival = festivalOn(selected);

  const leadingBlanks = days.length ? days[0].weekday : 0;
  const canGoBack = !(month.year === BS_MIN_YEAR && month.month === 1);
  const canGoForward = !(month.year === BS_MAX_YEAR && month.month === 12);

  const step = (by: number) => setMonth(shiftBsMonth(month.year, month.month, by));

  return (
    <Screen>
      <NavHeader title="Nepali Patro" bordered />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.monthBar}>
          <Tappable
            feel="icon"
            accessibilityRole="button"
            accessibilityLabel="Previous month"
            disabled={!canGoBack}
            onPress={() => step(-1)}
            hitSlop={10}
            style={[styles.arrow, !canGoBack && styles.disabled]}
            pressedStyle={styles.pressed}
          >
            <ChevronLeft size={22} color={colors.ink} strokeWidth={2.2} />
          </Tappable>

          <View style={styles.monthText}>
            <Text style={styles.monthNp}>
              {BS_MONTHS_NP[month.month - 1]} {devanagariNumber(month.year)}
            </Text>
            <Text style={styles.monthEn}>
              {BS_MONTHS[month.month - 1]} {month.year} ·{' '}
              {days.length ? `${formatGregorian(days[0].gregorian).split(' ').slice(1).join(' ')} –` : ''}{' '}
              {days.length ? formatGregorian(days[days.length - 1].gregorian).split(' ').slice(1).join(' ') : ''}
            </Text>
          </View>

          <Tappable
            feel="icon"
            accessibilityRole="button"
            accessibilityLabel="Next month"
            disabled={!canGoForward}
            onPress={() => step(1)}
            hitSlop={10}
            style={[styles.arrow, !canGoForward && styles.disabled]}
            pressedStyle={styles.pressed}
          >
            <ChevronRight size={22} color={colors.ink} strokeWidth={2.2} />
          </Tappable>
        </View>

        <View style={styles.weekHead}>
          {WEEKDAY_SHORT.map((label, i) => (
            <Text key={label} style={[styles.weekLabel, i === 6 && styles.saturday]}>
              {label}
            </Text>
          ))}
        </View>

        <View style={styles.grid}>
          {Array.from({ length: leadingBlanks }, (_, i) => (
            <View key={`blank-${i}`} style={styles.cell} />
          ))}

          {days.map((day) => {
            const festival = festivalOn(day.gregorian);
            const isSelected = isSameNepaliDay(day.gregorian, selected);

            return (
              <Tappable
                key={day.bsDay}
                accessibilityRole="button"
                accessibilityLabel={`${day.bsDay} ${BS_MONTHS[month.month - 1]}, ${formatGregorian(day.gregorian)}${festival ? `, ${festival.name}` : ''}`}
                onPress={() => setSelected(day.gregorian)}
                style={[styles.cell, isSelected && styles.cellSelected, day.isToday && styles.cellToday]}
                pressedStyle={styles.pressed}
              >
                <Text
                  style={[
                    styles.cellNp,
                    (day.isSaturday || festival?.holiday) && styles.saturday,
                    isSelected && styles.cellSelectedText,
                  ]}
                >
                  {devanagariNumber(day.bsDay)}
                </Text>
                <Text style={[styles.cellAd, isSelected && styles.cellSelectedText]}>
                  {day.gregorianDay}
                </Text>
                {festival ? <View style={styles.dot} /> : null}
              </Tappable>
            );
          })}
        </View>

        <Card style={styles.card}>
          <Text style={styles.selectedDate}>{formatGregorian(selected)}</Text>
          <Text style={styles.selectedBs}>
            {selectedPanchang.weekday.np} · {selectedPanchang.tithi.paksha}{' '}
            {selectedPanchang.tithi.name} · {selectedPanchang.nakshatra.meta.name}
          </Text>

          {selectedFestival ? (
            <View style={styles.festivalBlock}>
              <Tag label={selectedFestival.holiday ? 'Public holiday' : 'Festival'} tone="accent" />
              <Text style={styles.festivalName}>
                {selectedFestival.name} · {selectedFestival.np}
              </Text>
              <Text style={styles.festivalAbout}>{selectedFestival.about}</Text>
              {selectedFestival.sait ? (
                <Text style={styles.sait}>
                  Tika sait {formatClock(selectedFestival.sait.from)} –{' '}
                  {formatClock(selectedFestival.sait.to)}
                </Text>
              ) : null}
            </View>
          ) : null}

          <View style={styles.sunRow}>
            <Text style={styles.sunText}>
              Sunrise {selectedPanchang.sunrise ? formatClock(selectedPanchang.sunrise) : '—'}
            </Text>
            <Text style={styles.sunText}>
              Sunset {selectedPanchang.sunset ? formatClock(selectedPanchang.sunset) : '—'}
            </Text>
          </View>

          <TextLink
            label="See the full panchang"
            accessibilityLabel="Open the full panchang"
            onPress={() => router.push('/panchang')}
            style={styles.link}
          />
        </Card>

        <Text style={styles.footnote}>
          Saturday is marked red, as it is on a paper patro — Nepal's week ends on
          Saturday, not Sunday. A dot marks a festival; tap the day to see it.
        </Text>
      </ScrollView>
    </Screen>
  );
}

const CELL = `${100 / 7}%`;

const styles = StyleSheet.create({
  content: { paddingTop: space.md, paddingBottom: space.xxl },
  monthBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: GUTTER, gap: space.md,
  },
  arrow: {
    width: 40, height: 40, borderRadius: radius.md, alignItems: 'center',
    justifyContent: 'center', backgroundColor: colors.fill,
  },
  disabled: { opacity: 0.3 },
  pressed: { opacity: 0.6 },
  monthText: { flex: 1, alignItems: 'center' },
  monthNp: { ...type.title, color: colors.ink },
  monthEn: { ...type.caption, color: colors.muted },
  weekHead: { flexDirection: 'row', paddingHorizontal: GUTTER - space.xs, marginTop: space.lg },
  weekLabel: { width: CELL, ...type.caption, color: colors.muted, textAlign: 'center' },
  saturday: { color: colors.red },
  grid: {
    flexDirection: 'row', flexWrap: 'wrap',
    paddingHorizontal: GUTTER - space.xs, marginTop: space.xs,
  },
  cell: {
    width: CELL, aspectRatio: 0.92, alignItems: 'center', justifyContent: 'center',
    borderRadius: radius.sm, paddingVertical: 2,
  },
  cellSelected: { backgroundColor: colors.saffron },
  cellSelectedText: { color: colors.onSaffron },
  cellToday: { borderWidth: 1.5, borderColor: colors.saffron },
  cellNp: { ...type.section, color: colors.ink },
  cellAd: { ...type.caption, fontSize: 10, color: colors.subtle },
  dot: { width: 4, height: 4, borderRadius: 2, backgroundColor: colors.saffronDeep, marginTop: 1 },
  card: { marginHorizontal: GUTTER, marginTop: space.lg },
  selectedDate: { ...type.section, color: colors.ink },
  selectedBs: { ...type.small, color: colors.muted },
  festivalBlock: { marginTop: space.md, gap: space.xs },
  festivalName: { ...type.label, color: colors.ink },
  festivalAbout: { ...type.small, color: colors.muted },
  sait: { ...type.small, color: colors.saffronDeep },
  sunRow: { flexDirection: 'row', gap: space.lg, marginTop: space.md },
  sunText: { ...type.small, color: colors.body },
  link: { marginTop: space.md },
  footnote: { ...type.small, color: colors.subtle, paddingHorizontal: GUTTER, marginTop: space.xl },
});
