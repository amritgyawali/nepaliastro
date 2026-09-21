import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Card, DataRow, NavHeader, Screen, Segmented, WheelColumn, WheelPicker } from '@/components';
import {
  BS_MAX_YEAR, BS_MIN_YEAR, BS_MONTHS, BS_MONTHS_NP, bsMonthLength,
  devanagariNumber, formatBs, formatBsNepali, formatGregorian, fromBs,
  nakshatraToday, nepaliClock, panchangFor, toBs, toNepalSambat,
} from '@/lib/jyotish';
import { GUTTER, colors, space, type } from '@/theme';

const GREGORIAN_MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const AD_MIN = 1944;
const AD_MAX = 2033;

type Mode = 'bsToAd' | 'adToBs';

/**
 * The date converter.
 *
 * Bikram Sambat is the calendar every Nepali document uses, and its months
 * have no formula — they run from twenty-nine to thirty-two days and the
 * lengths are fixed each year by the sun's position, published in the patro.
 * So this is table-driven, and it refuses politely outside the years the
 * tables cover rather than extrapolating a date that would be wrong.
 */
export default function DateConverterScreen() {
  const [mode, setMode] = useState<Mode>('adToBs');
  const today = useMemo(() => new Date(), []);
  const todayBs = useMemo(() => toBs(today), [today]);

  const [bs, setBs] = useState(() => ({
    year: todayBs?.year ?? 2082,
    month: todayBs?.month ?? 1,
    day: todayBs?.day ?? 1,
  }));
  // Prefilled with Nepal's today rather than the device's, so the two sides of
  // the converter agree for a user abroad.
  const [ad, setAd] = useState(() => {
    const clock = nepaliClock(today);
    return { year: clock.year, month: clock.month, day: clock.day };
  });

  // The two directions share one result: whichever side is being edited, the
  // answer is a single instant described in every calendar at once.
  const resolved = useMemo(() => {
    if (mode === 'bsToAd') return fromBs(bs.year, bs.month, bs.day);
    return new Date(ad.year, ad.month - 1, ad.day, 12);
  }, [mode, bs, ad]);

  const converted = resolved ? toBs(resolved) : null;
  const nepalSambat = resolved ? toNepalSambat(resolved) : null;
  const panchang = resolved ? panchangFor(resolved) : null;

  const bsYearOptions = useMemo(
    () =>
      Array.from({ length: BS_MAX_YEAR - BS_MIN_YEAR + 1 }, (_, i) => ({
        label: devanagariNumber(BS_MIN_YEAR + i),
        value: BS_MIN_YEAR + i,
      })),
    [],
  );
  const bsMonthOptions = useMemo(
    () => BS_MONTHS.map((label, i) => ({ label: `${label} / ${BS_MONTHS_NP[i]}`, value: i + 1 })),
    [],
  );
  const bsDayOptions = useMemo(
    () =>
      Array.from({ length: bsMonthLength(bs.year, bs.month) }, (_, i) => ({
        label: devanagariNumber(i + 1),
        value: i + 1,
      })),
    [bs.year, bs.month],
  );

  const adYearOptions = useMemo(
    () => Array.from({ length: AD_MAX - AD_MIN + 1 }, (_, i) => ({ label: `${AD_MIN + i}`, value: AD_MIN + i })),
    [],
  );
  const adMonthOptions = useMemo(
    () => GREGORIAN_MONTHS.map((label, i) => ({ label, value: i + 1 })),
    [],
  );
  const adDayOptions = useMemo(
    () =>
      Array.from({ length: new Date(ad.year, ad.month, 0).getDate() }, (_, i) => ({
        label: `${i + 1}`,
        value: i + 1,
      })),
    [ad.year, ad.month],
  );

  const setBsPart = (patch: Partial<typeof bs>) => {
    const next = { ...bs, ...patch };
    setBs({ ...next, day: Math.min(next.day, bsMonthLength(next.year, next.month)) });
  };
  const setAdPart = (patch: Partial<typeof ad>) => {
    const next = { ...ad, ...patch };
    setAd({ ...next, day: Math.min(next.day, new Date(next.year, next.month, 0).getDate()) });
  };

  return (
    <Screen>
      <NavHeader title="Date converter" bordered />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.segmented}>
          <Segmented
            value={mode}
            onChange={setMode}
            options={[
              { value: 'adToBs', label: 'AD → BS' },
              { value: 'bsToAd', label: 'BS → AD' },
            ]}
          />
        </View>

        <Card style={styles.card}>
          {mode === 'bsToAd' ? (
            <>
              <Text style={styles.label}>Bikram Sambat</Text>
              <WheelPicker>
                <WheelColumn options={bsDayOptions} value={bs.day} onChange={(day) => setBsPart({ day: day as number })} flex={1} />
                <WheelColumn options={bsMonthOptions} value={bs.month} onChange={(month) => setBsPart({ month: month as number })} flex={2.4} />
                <WheelColumn options={bsYearOptions} value={bs.year} onChange={(year) => setBsPart({ year: year as number })} flex={1.2} />
              </WheelPicker>
            </>
          ) : (
            <>
              <Text style={styles.label}>Gregorian (AD)</Text>
              <WheelPicker>
                <WheelColumn options={adDayOptions} value={ad.day} onChange={(day) => setAdPart({ day: day as number })} flex={1} />
                <WheelColumn options={adMonthOptions} value={ad.month} onChange={(month) => setAdPart({ month: month as number })} flex={2.2} />
                <WheelColumn options={adYearOptions} value={ad.year} onChange={(year) => setAdPart({ year: year as number })} flex={1.2} />
              </WheelPicker>
            </>
          )}
        </Card>

        {resolved && converted ? (
          <>
            <Card accent style={styles.card}>
              <Text style={styles.resultLabel}>
                {mode === 'bsToAd' ? 'In the Gregorian calendar' : 'In Bikram Sambat'}
              </Text>
              <Text style={styles.resultBig}>
                {mode === 'bsToAd' ? formatGregorian(resolved) : formatBsNepali(converted)}
              </Text>
              <Text style={styles.resultSmall}>
                {mode === 'bsToAd' ? formatBs(converted) : formatGregorian(resolved)}
              </Text>
            </Card>

            <Card padded={false} style={styles.card}>
              <View style={styles.pad}>
                <DataRow
                  label="Bikram Sambat"
                  value={formatBs(converted)}
                  note={formatBsNepali(converted)}
                  divided={false}
                />
                <DataRow label="Gregorian" value={formatGregorian(resolved)} />
                {nepalSambat ? (
                  <DataRow
                    label="Nepal Sambat"
                    value={`${nepalSambat.year}, day ${nepalSambat.dayOfYear}`}
                    note={`This Newar year began on ${formatGregorian(nepalSambat.newYear)} — Mha Puja`}
                  />
                ) : null}
                {panchang ? (
                  <>
                    <DataRow label="Weekday" value={`${panchang.weekday.en} · ${panchang.weekday.np}`} />
                    <DataRow
                      label="Tithi"
                      value={`${panchang.tithi.paksha} ${panchang.tithi.name}`}
                      note="The lunar day running at sunrise"
                    />
                    <DataRow
                      label="Nakshatra"
                      value={nakshatraToday(panchang.date).meta.name}
                      note="The lunar mansion the moon was crossing"
                    />
                    <DataRow label="Shaka Samvat" value={`${panchang.shakaSamvat}`} />
                  </>
                ) : null}
              </View>
            </Card>
          </>
        ) : (
          <Card style={styles.card}>
            <Text style={styles.outOfRange}>
              That date is outside the published Bikram Sambat tables, which run from{' '}
              {BS_MIN_YEAR} to {BS_MAX_YEAR} BS. The month lengths for other years have
              not been fixed, so converting them would mean guessing.
            </Text>
          </Card>
        )}

        <Text style={styles.footnote}>
          Bikram Sambat months vary between twenty-nine and thirty-two days, and the
          lengths differ year to year — which is why a formula cannot do this and the
          tables have to be carried. Nepal Sambat is computed from the real new moon:
          its year turns the day after Kartik Amavasya, on Mha Puja.
        </Text>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: space.lg, paddingBottom: space.xxl },
  segmented: { marginBottom: space.md },
  card: { marginHorizontal: GUTTER, marginTop: space.md },
  pad: { paddingHorizontal: space.lg, paddingVertical: space.xs },
  label: { ...type.label, color: colors.muted, marginBottom: space.sm },
  resultLabel: { ...type.caption, color: colors.saffronDeep, textTransform: 'uppercase', letterSpacing: 0.6 },
  resultBig: { ...type.display, color: colors.ink, marginTop: 2 },
  resultSmall: { ...type.body, color: colors.body },
  outOfRange: { ...type.body, color: colors.muted },
  footnote: { ...type.small, color: colors.subtle, paddingHorizontal: GUTTER, marginTop: space.xl },
});
