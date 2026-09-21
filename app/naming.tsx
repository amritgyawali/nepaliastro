import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import {
  BirthDetailsForm, Card, NavHeader, PrimaryButton, Screen, Segmented,
  emptyBirthDetails, type BirthDetails,
} from '@/components';
import { buildChart, namkaranFor, namesForSyllable } from '@/lib/jyotish';
import { GUTTER, colors, space, type } from '@/theme';

/**
 * Namkaran — the first syllable of a newborn's name.
 *
 * The moon's nakshatra and pada at the moment of birth give one syllable out
 * of a hundred and eight, and the child's name traditionally begins with it.
 * Parents come for this in the first two weeks of a life, usually with the
 * hospital's printed time in hand — which is the one case where a birth time
 * is reliably known to the minute.
 */
export default function NamingScreen() {
  const [details, setDetails] = useState<BirthDetails>(() => {
    const base = emptyBirthDetails();
    const today = new Date();
    return {
      ...base,
      timeKnown: true,
      date: { day: today.getDate(), month: today.getMonth() + 1, year: today.getFullYear() },
      time: { hour: today.getHours(), minute: today.getMinutes() },
    };
  });
  const [submitted, setSubmitted] = useState(false);
  const [syllable, setSyllable] = useState<string | null>(null);

  const reading = useMemo(() => {
    if (!submitted) return null;
    const { date, time, timeKnown, place } = details;
    const chart = buildChart({
      at: new Date(
        Date.UTC(date.year, date.month - 1, date.day, timeKnown ? time.hour : 12, timeKnown ? time.minute : 0) -
          place.utcOffsetMinutes * 60_000,
      ),
      place,
      timeKnown,
    });
    return namkaranFor(chart);
  }, [submitted, details]);

  const activeSyllable = syllable ?? reading?.syllable ?? null;
  const names = activeSyllable ? namesForSyllable(activeSyllable) : [];

  return (
    <Screen>
      <NavHeader title="Namkaran" bordered />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {reading ? (
          <>
            <Card accent style={styles.card}>
              <Text style={styles.label}>The syllable</Text>
              <Text style={styles.syllable}>{reading.syllable}</Text>
              <Text style={styles.detail}>
                Born in {reading.nakshatra} ({reading.np}), pada {reading.pada}. The
                nakshatra's presiding deity is {reading.deity}.
              </Text>
            </Card>

            <Text style={styles.sectionTitle}>All four padas of {reading.nakshatra}</Text>
            <Text style={styles.sectionNote}>
              The child's own pada gives the first syllable, but families often choose
              from any of the four.
            </Text>
            <View style={styles.segmented}>
              <Segmented
                scrollable
                value={activeSyllable ?? reading.syllable}
                onChange={setSyllable}
                options={reading.allSyllables.map((s, i) => ({
                  value: s,
                  label: `${s}${i + 1 === reading.pada ? ' ●' : ''}`,
                }))}
              />
            </View>

            <Card style={styles.card}>
              {names.length ? (
                names.map((name) => (
                  <View key={name.name} style={styles.nameRow}>
                    <View style={styles.nameHead}>
                      <Text style={styles.name}>{name.name}</Text>
                      <Text style={styles.nameNp}>{name.np}</Text>
                    </View>
                    <Text style={styles.meaning}>{name.meaning}</Text>
                  </View>
                ))
              ) : (
                <Text style={styles.empty}>
                  No names listed for “{activeSyllable}” yet — any name beginning with
                  that sound carries the same blessing.
                </Text>
              )}
            </Card>

            <Card title="The ceremony" style={styles.card}>
              <Text style={styles.body}>{reading.ceremony}</Text>
            </Card>

            <PrimaryButton
              label="Another child"
              variant="outline"
              onPress={() => {
                setSubmitted(false);
                setSyllable(null);
              }}
              style={styles.cta}
            />
          </>
        ) : (
          <>
            <Text style={styles.intro}>
              Enter the child's birth moment. The syllable comes from where the moon
              stood — so the time matters here more than almost anywhere else, and a
              hospital record usually has it to the minute.
            </Text>

            <Card style={styles.card}>
              <BirthDetailsForm
                title="The child"
                value={details}
                onChange={setDetails}
              />
            </Card>

            <PrimaryButton
              label="Find the syllable"
              onPress={() => setSubmitted(true)}
              style={styles.cta}
            />
          </>
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: space.lg, paddingBottom: space.xxl },
  card: { marginHorizontal: GUTTER, marginTop: space.md },
  intro: { ...type.body, color: colors.muted, paddingHorizontal: GUTTER },
  label: { ...type.caption, color: colors.saffronDeep, textTransform: 'uppercase', letterSpacing: 0.6 },
  syllable: { ...type.display, fontSize: 52, lineHeight: 60, color: colors.ink },
  detail: { ...type.body, color: colors.body, marginTop: space.xs },
  sectionTitle: { ...type.section, color: colors.ink, paddingHorizontal: GUTTER, marginTop: space.xl },
  sectionNote: { ...type.small, color: colors.muted, paddingHorizontal: GUTTER },
  segmented: { marginTop: space.md },
  nameRow: {
    paddingVertical: space.sm, borderBottomWidth: 1, borderBottomColor: colors.divider,
  },
  nameHead: { flexDirection: 'row', alignItems: 'baseline', gap: space.sm },
  name: { ...type.section, color: colors.ink },
  nameNp: { ...type.body, color: colors.saffronDeep },
  meaning: { ...type.small, color: colors.muted },
  empty: { ...type.body, color: colors.muted },
  body: { ...type.body, color: colors.body },
  cta: { marginHorizontal: GUTTER, marginTop: space.xl },
});
