import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Card, DataRow, NavHeader, Screen, Segmented, Tag } from '@/components';
import {
  activeWindow, formatBsNepali, formatClock, formatDuration, formatGregorian,
  panchangFor, placeOf, toBs, type Window,
} from '@/lib/jyotish';
import { useOnboarding } from '@/store/onboarding';
import { GUTTER, colors, space, type } from '@/theme';

type PanchangView = 'angas' | 'windows' | 'hora';

/** "ends 8:17 PM" — the part that makes a panchang usable rather than decorative. */
function endsAt(at: Date, now: Date): string {
  const minutes = Math.round((at.getTime() - now.getTime()) / 60_000);
  if (minutes <= 0) return 'ended';
  return `until ${formatClock(at)} · ${formatDuration(minutes)} left`;
}

function WindowRow({ window, now }: { window: Window; now: Date }) {
  const active = now >= window.from && now < window.to;
  return (
    <View style={[styles.windowRow, active && styles.windowActive]}>
      <View style={styles.windowText}>
        <Text style={styles.windowName}>{window.name}</Text>
        <Text style={styles.windowAbout}>{window.about}</Text>
      </View>
      <View style={styles.windowRight}>
        <Text style={styles.windowTime}>
          {formatClock(window.from)} – {formatClock(window.to)}
        </Text>
        {active ? <Tag label="Now" tone={window.quality === 'bad' ? 'bad' : 'good'} /> : null}
      </View>
    </View>
  );
}

/**
 * Today's panchang, in full.
 *
 * The five limbs each carry the moment they end, because a tithi is a span of
 * the moon pulling ahead of the sun, not a day: it can begin at four in the
 * afternoon and give way at nine the next morning, and a fast fixed to it
 * follows the tithi, not the date.
 */
export default function PanchangScreen() {
  const { profile } = useOnboarding();
  const [view, setView] = useState<PanchangView>('angas');
  const now = useMemo(() => new Date(), []);

  const place = useMemo(() => placeOf(profile), [profile]);
  const panchang = useMemo(() => panchangFor(now, place), [now, place]);
  const bs = useMemo(() => toBs(now), [now]);
  const windows = panchang.windows;

  const currentChoghadiya = windows
    ? activeWindow([...windows.choghadiyaDay, ...windows.choghadiyaNight], now)
    : null;
  const currentHora = windows ? activeWindow(windows.hora, now) : null;

  return (
    <Screen>
      <NavHeader title="Panchang" bordered />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.head}>
          <Text style={styles.date}>{formatGregorian(now)}</Text>
          {bs ? <Text style={styles.bs}>{formatBsNepali(bs)}</Text> : null}
          <Text style={styles.place}>
            {panchang.weekday.en} · {place.name} · Vikram Samvat {panchang.vikramSamvat}
          </Text>
        </View>

        {currentChoghadiya || currentHora ? (
          <Card accent style={styles.card}>
            <Text style={styles.nowLabel}>Right now</Text>
            {currentChoghadiya ? (
              <Text style={styles.nowValue}>
                {currentChoghadiya.name} choghadiya — {currentChoghadiya.about}
              </Text>
            ) : null}
            {currentHora ? (
              <Text style={styles.nowSecondary}>
                {currentHora.name} · {currentHora.about}
              </Text>
            ) : null}
          </Card>
        ) : null}

        <View style={styles.segmented}>
          <Segmented
            value={view}
            onChange={setView}
            options={[
              { value: 'angas', label: 'Five limbs' },
              { value: 'windows', label: 'Good & bad' },
              { value: 'hora', label: 'Choghadiya' },
            ]}
          />
        </View>

        {view === 'angas' ? (
          <>
            <Card padded={false} style={styles.card}>
              <View style={styles.pad}>
                <DataRow
                  label="Tithi"
                  value={`${panchang.tithi.paksha} ${panchang.tithi.name}`}
                  note={endsAt(panchang.tithi.endsAt, now)}
                  divided={false}
                />
                <DataRow
                  label="Nakshatra"
                  value={`${panchang.nakshatra.meta.name}, pada ${panchang.nakshatra.pada}`}
                  note={endsAt(panchang.nakshatra.endsAt, now)}
                />
                <DataRow
                  label="Yoga"
                  value={panchang.yoga.name}
                  note={
                    panchang.yoga.harsh
                      ? `One of the nine held unfit for new work · ${endsAt(panchang.yoga.endsAt, now)}`
                      : endsAt(panchang.yoga.endsAt, now)
                  }
                  tone={panchang.yoga.harsh ? 'bad' : 'default'}
                />
                <DataRow
                  label="Karana"
                  value={panchang.karana.name}
                  note={
                    panchang.karana.vishti
                      ? `Bhadra — nothing auspicious is begun · ${endsAt(panchang.karana.endsAt, now)}`
                      : endsAt(panchang.karana.endsAt, now)
                  }
                  tone={panchang.karana.vishti ? 'bad' : 'default'}
                />
                <DataRow
                  label="Vara"
                  value={`${panchang.weekday.en} (${panchang.weekday.np})`}
                  note={`Ruled by ${panchang.weekday.lord}`}
                />
              </View>
            </Card>

            <Card padded={false} style={styles.card}>
              <View style={styles.pad}>
                <DataRow
                  label="Sunrise"
                  value={panchang.sunrise ? formatClock(panchang.sunrise) : '—'}
                  note="The panchang day begins here, not at midnight"
                  divided={false}
                />
                <DataRow label="Sunset" value={panchang.sunset ? formatClock(panchang.sunset) : '—'} />
                <DataRow
                  label="Day length"
                  value={panchang.dayLength !== null ? formatDuration(panchang.dayLength) : '—'}
                />
                <DataRow
                  label="Moonrise"
                  value={panchang.moonrise ? formatClock(panchang.moonrise) : 'None today'}
                  note={panchang.moonrise ? undefined : 'The moon rises about fifty minutes later each day, so some dates have none'}
                />
                <DataRow label="Moonset" value={panchang.moonset ? formatClock(panchang.moonset) : 'None today'} />
              </View>
            </Card>

            <Card padded={false} style={styles.card}>
              <View style={styles.pad}>
                <DataRow label="Sun in" value={panchang.solarRashi} note="The solar month" divided={false} />
                <DataRow label="Ritu" value={`${panchang.ritu.name} — ${panchang.ritu.en}`} />
                <DataRow
                  label="Ayana"
                  value={panchang.ayana}
                  note={panchang.ayana === 'Uttarayana' ? 'The sun is travelling north' : 'The sun is travelling south'}
                />
                <DataRow label="Vikram Samvat" value={`${panchang.vikramSamvat}`} />
                <DataRow label="Shaka Samvat" value={`${panchang.shakaSamvat}`} />
              </View>
            </Card>
          </>
        ) : null}

        {view === 'windows' && windows ? (
          <>
            <Card padded={false} style={styles.card}>
              <WindowRow window={windows.rahuKaal} now={now} />
              <WindowRow window={windows.yamaganda} now={now} />
              <WindowRow window={windows.gulika} now={now} />
              {windows.abhijit ? <WindowRow window={windows.abhijit} now={now} /> : null}
            </Card>
            {!windows.abhijit ? (
              <Text style={styles.note}>
                There is no abhijit muhurta on a Wednesday — the day belongs to Budha.
              </Text>
            ) : null}
          </>
        ) : null}

        {view === 'hora' && windows ? (
          <>
            <Text style={styles.sectionTitle}>Day choghadiya</Text>
            <Card padded={false} style={styles.card}>
              {windows.choghadiyaDay.map((w, i) => (
                <View key={`${w.name}-${i}`} style={i > 0 ? styles.divided : undefined}>
                  <WindowRow window={w} now={now} />
                </View>
              ))}
            </Card>

            <Text style={styles.sectionTitle}>Night choghadiya</Text>
            <Card padded={false} style={styles.card}>
              {windows.choghadiyaNight.map((w, i) => (
                <View key={`${w.name}-night-${i}`} style={i > 0 ? styles.divided : undefined}>
                  <WindowRow window={w} now={now} />
                </View>
              ))}
            </Card>

            <Text style={styles.sectionTitle}>Hora</Text>
            <Card padded={false} style={styles.card}>
              {windows.hora.slice(0, 12).map((w, i) => (
                <View key={`${w.name}-${i}`} style={i > 0 ? styles.divided : undefined}>
                  <WindowRow window={w} now={now} />
                </View>
              ))}
            </Card>
          </>
        ) : null}

        <Text style={styles.footnote}>
          Computed for {place.name} from the actual positions of the sun and moon. The
          end time of each limb is found by solving for the moment it crosses its
          boundary, so it is exact to the minute rather than divided evenly.
        </Text>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: space.lg, paddingBottom: space.xxl },
  head: { paddingHorizontal: GUTTER, marginBottom: space.md },
  date: { ...type.display, color: colors.ink },
  bs: { ...type.title, color: colors.saffronDeep },
  place: { ...type.small, color: colors.muted, marginTop: 2 },
  card: { marginHorizontal: GUTTER, marginTop: space.md },
  pad: { paddingHorizontal: space.lg, paddingVertical: space.xs },
  segmented: { marginTop: space.lg },
  nowLabel: { ...type.caption, color: colors.saffronDeep, textTransform: 'uppercase', letterSpacing: 0.6 },
  nowValue: { ...type.section, color: colors.ink, marginTop: 2 },
  nowSecondary: { ...type.small, color: colors.body, marginTop: 2 },
  sectionTitle: { ...type.section, color: colors.ink, paddingHorizontal: GUTTER, marginTop: space.xl },
  windowRow: {
    flexDirection: 'row', alignItems: 'center', gap: space.md,
    paddingHorizontal: space.lg, paddingVertical: space.md,
  },
  windowActive: { backgroundColor: colors.saffronSoft },
  windowText: { flex: 1 },
  windowName: { ...type.label, color: colors.ink },
  windowAbout: { ...type.small, color: colors.muted },
  windowRight: { alignItems: 'flex-end', gap: space.xs },
  windowTime: { ...type.small, color: colors.body },
  divided: { borderTopWidth: 1, borderTopColor: colors.divider },
  note: { ...type.small, color: colors.muted, paddingHorizontal: GUTTER, marginTop: space.sm },
  footnote: { ...type.small, color: colors.subtle, paddingHorizontal: GUTTER, marginTop: space.xl },
});
