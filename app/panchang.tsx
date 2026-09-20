import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { NavHeader, PrimaryButton, Screen } from '@/components';
import { formatToday } from '@/lib/astro';
import { panchangFor } from '@/lib/panchang';
import { GUTTER, colors, radius, space, type } from '@/theme';

/** Minutes between two "HH:MM" times, or null if either is unavailable. */
function minutesBetween(from: string, to: string): number | null {
  if (from === '--:--' || to === '--:--') return null;
  const [fromHour, fromMinute] = from.split(':').map(Number);
  const [toHour, toMinute] = to.split(':').map(Number);
  return toHour * 60 + toMinute - (fromHour * 60 + fromMinute);
}

function describeMoon(phase: number): string {
  if (phase < 0.03 || phase > 0.97) return 'New moon';
  if (phase < 0.22) return 'Waxing crescent';
  if (phase < 0.28) return 'First quarter';
  if (phase < 0.47) return 'Waxing gibbous';
  if (phase < 0.53) return 'Full moon';
  if (phase < 0.72) return 'Waning gibbous';
  if (phase < 0.78) return 'Last quarter';
  return 'Waning crescent';
}

/** Today's panchang in full, with what each figure is for. */
export default function PanchangScreen() {
  const router = useRouter();
  const now = useMemo(() => new Date(), []);
  const panchang = useMemo(() => panchangFor(now), [now]);

  const dayLength = minutesBetween(panchang.sun.sunrise, panchang.sun.sunset);
  const weekdays = [
    'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday',
  ];

  const rows = [
    {
      label: 'Sunrise',
      value: panchang.sun.sunrise,
      note: 'The day’s reckoning starts here, not at midnight',
    },
    { label: 'Sunset', value: panchang.sun.sunset, note: 'And ends here' },
    {
      label: 'Day length',
      value: dayLength === null ? '—' : `${Math.floor(dayLength / 60)}h ${dayLength % 60}m`,
      note: 'Between sunrise and sunset',
    },
    {
      label: 'Tithi',
      value: `${panchang.tithi.paksha} ${panchang.tithi.name}`,
      note: `Lunar day ${panchang.tithi.index} of 30 — most fasts and festivals are fixed to one`,
    },
    {
      label: 'Paksha',
      value: panchang.tithi.paksha === 'Shukla' ? 'Shukla (waxing)' : 'Krishna (waning)',
      note: describeMoon(panchang.tithi.phase),
    },
    {
      label: 'Nakshatra',
      value: panchang.nakshatra.name,
      note: `Pada ${panchang.nakshatra.pada} — the lunar mansion the moon is crossing`,
    },
    {
      label: 'Vara',
      value: weekdays[now.getDay()],
      note: 'The weekday, each with its own ruling planet',
    },
  ];

  return (
    <Screen background={colors.white}>
      <NavHeader title="Today’s panchang" bordered />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.head}>
          <Text style={styles.place}>{panchang.place}</Text>
          <Text style={styles.date}>{formatToday(now)}</Text>
        </View>

        <View style={styles.card}>
          {rows.map((row, index) => (
            <View key={row.label} style={[styles.row, index > 0 && styles.rowDivider]}>
              <View style={styles.rowHead}>
                <Text style={styles.rowLabel}>{row.label}</Text>
                <Text style={styles.rowValue}>{row.value}</Text>
              </View>
              <Text style={styles.rowNote}>{row.note}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.note}>
          Sunrise and sunset are computed for Kathmandu, and the tithi and nakshatra from
          mean lunar elements — accurate to about a minute for the sun and a fraction of
          a tithi for the moon. For muhurta precise enough to act on, ask an astrologer.
        </Text>

        <PrimaryButton
          label="Ask about an auspicious time"
          onPress={() => router.push('/(tabs)/chat')}
          style={styles.cta}
        />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: GUTTER,
    paddingTop: space.lg,
    paddingBottom: space.xxl,
  },
  head: {
    marginBottom: space.lg,
  },
  place: {
    ...type.display,
    color: colors.ink,
  },
  date: {
    ...type.body,
    color: colors.muted,
  },
  card: {
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  row: {
    paddingHorizontal: space.lg,
    paddingVertical: space.md,
  },
  rowDivider: {
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  rowHead: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: space.md,
  },
  rowLabel: {
    ...type.label,
    color: colors.muted,
  },
  rowValue: {
    ...type.section,
    color: colors.ink,
    flexShrink: 1,
    textAlign: 'right',
  },
  rowNote: {
    ...type.small,
    color: colors.muted,
    marginTop: 2,
  },
  note: {
    ...type.small,
    color: colors.muted,
    marginTop: space.lg,
  },
  cta: {
    marginTop: space.xl,
  },
});
