import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { PLACES, type Place, searchPlaces } from '@/lib/jyotish';
import { colors, radius, space, type } from '@/theme';

import { WheelColumn, WheelPicker } from '../WheelPicker';

export type BirthDetails = {
  name: string;
  date: { day: number; month: number; year: number };
  time: { hour: number; minute: number };
  timeKnown: boolean;
  place: Place;
};

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const CURRENT_YEAR = new Date().getFullYear();
const FIRST_YEAR = CURRENT_YEAR - 100;

function daysInMonth(month: number, year: number): number {
  return new Date(year, month, 0).getDate();
}

export function emptyBirthDetails(): BirthDetails {
  return {
    name: '',
    date: { day: 1, month: 1, year: 1998 },
    time: { hour: 12, minute: 0 },
    timeKnown: false,
    place: PLACES[0],
  };
}

type BirthDetailsFormProps = {
  value: BirthDetails;
  onChange: (value: BirthDetails) => void;
  /** Heading above the form, e.g. "Their details". */
  title: string;
  /** Hides the time wheels for readings that only need a date. */
  askTime?: boolean;
};

/**
 * Birth details for somebody who is not the account holder.
 *
 * Used for the other person in a match and for anyone whose chart is being
 * drawn as a one-off. Time is optional and defaults to unknown, because it
 * usually is: the birth certificate gives a date, and the hour is whatever
 * an aunt remembers.
 */
export function BirthDetailsForm({ value, onChange, title, askTime = true }: BirthDetailsFormProps) {
  const [placeQuery, setPlaceQuery] = useState('');
  const [pickingPlace, setPickingPlace] = useState(false);

  const dayOptions = useMemo(
    () =>
      Array.from({ length: daysInMonth(value.date.month, value.date.year) }, (_, i) => ({
        label: `${i + 1}`,
        value: i + 1,
      })),
    [value.date.month, value.date.year],
  );
  const monthOptions = useMemo(() => MONTHS.map((label, i) => ({ label, value: i + 1 })), []);
  const yearOptions = useMemo(
    () =>
      Array.from({ length: CURRENT_YEAR - FIRST_YEAR + 1 }, (_, i) => ({
        label: `${FIRST_YEAR + i}`,
        value: FIRST_YEAR + i,
      })),
    [],
  );
  const hourOptions = useMemo(
    () => Array.from({ length: 24 }, (_, i) => ({ label: `${i}`.padStart(2, '0'), value: i })),
    [],
  );
  const minuteOptions = useMemo(
    () => Array.from({ length: 60 }, (_, i) => ({ label: `${i}`.padStart(2, '0'), value: i })),
    [],
  );

  const setDate = (patch: Partial<BirthDetails['date']>) => {
    const next = { ...value.date, ...patch };
    onChange({
      ...value,
      date: { ...next, day: Math.min(next.day, daysInMonth(next.month, next.year)) },
    });
  };

  const results = searchPlaces(placeQuery, 8);

  return (
    <View style={styles.root}>
      <Text style={styles.title}>{title}</Text>

      <TextInput
        value={value.name}
        onChangeText={(name) => onChange({ ...value, name })}
        placeholder="Name"
        placeholderTextColor={colors.subtle}
        style={styles.input}
        accessibilityLabel="Name"
      />

      <Text style={styles.label}>Date of birth</Text>
      <WheelPicker>
        <WheelColumn options={dayOptions} value={value.date.day} onChange={(day) => setDate({ day: day as number })} flex={1} />
        <WheelColumn options={monthOptions} value={value.date.month} onChange={(month) => setDate({ month: month as number })} flex={2} />
        <WheelColumn options={yearOptions} value={value.date.year} onChange={(year) => setDate({ year: year as number })} flex={1.4} />
      </WheelPicker>

      {askTime ? (
        <>
          <View style={styles.timeHead}>
            <Text style={styles.label}>Time of birth</Text>
            <Pressable
              accessibilityRole="checkbox"
              accessibilityState={{ checked: !value.timeKnown }}
              accessibilityLabel="Time of birth is not known"
              onPress={() => onChange({ ...value, timeKnown: !value.timeKnown })}
              hitSlop={8}
            >
              <Text style={styles.toggle}>
                {value.timeKnown ? 'I don’t know it' : 'I do know it'}
              </Text>
            </Pressable>
          </View>

          <WheelPicker disabled={!value.timeKnown}>
            <WheelColumn
              options={hourOptions}
              value={value.time.hour}
              onChange={(hour) => onChange({ ...value, time: { ...value.time, hour: hour as number } })}
            />
            <WheelColumn
              options={minuteOptions}
              value={value.time.minute}
              onChange={(minute) => onChange({ ...value, time: { ...value.time, minute: minute as number } })}
            />
          </WheelPicker>

          {!value.timeKnown ? (
            <Text style={styles.hint}>
              Without a time the chart is drawn for noon. The moon sign and nakshatra
              stay reliable, which is all the eight koots need.
            </Text>
          ) : null}
        </>
      ) : null}

      <Text style={styles.label}>Place of birth</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Place of birth, currently ${value.place.name}`}
        onPress={() => setPickingPlace((open) => !open)}
        style={({ pressed }) => [styles.input, styles.placeButton, pressed && styles.pressed]}
      >
        <Text style={styles.placeName}>{value.place.name}</Text>
        <Text style={styles.placeRegion}>{value.place.region}</Text>
      </Pressable>

      {pickingPlace ? (
        <View style={styles.placePanel}>
          <TextInput
            value={placeQuery}
            onChangeText={setPlaceQuery}
            placeholder="Search a town or city"
            placeholderTextColor={colors.subtle}
            style={styles.input}
            autoFocus
            accessibilityLabel="Search places"
          />
          <ScrollView style={styles.placeList} keyboardShouldPersistTaps="handled" nestedScrollEnabled>
            {results.map((place) => (
              <Pressable
                key={place.id}
                accessibilityRole="button"
                accessibilityLabel={`${place.name}, ${place.region}`}
                onPress={() => {
                  onChange({ ...value, place });
                  setPickingPlace(false);
                  setPlaceQuery('');
                }}
                style={({ pressed }) => [styles.placeRow, pressed && styles.pressed]}
              >
                <Text style={styles.placeName}>{place.name}</Text>
                <Text style={styles.placeRegion}>{place.region}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { gap: space.sm },
  title: { ...type.section, color: colors.ink },
  label: { ...type.label, color: colors.muted, marginTop: space.sm },
  input: {
    minHeight: 48,
    borderRadius: radius.md,
    backgroundColor: colors.fill,
    paddingHorizontal: space.lg,
    justifyContent: 'center',
    ...type.body,
    color: colors.ink,
  },
  placeButton: { paddingVertical: space.sm },
  placeName: { ...type.body, color: colors.ink },
  placeRegion: { ...type.caption, color: colors.muted },
  placePanel: { gap: space.sm },
  placeList: { maxHeight: 220 },
  placeRow: {
    paddingVertical: space.md,
    paddingHorizontal: space.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  pressed: { opacity: 0.6 },
  timeHead: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: space.md,
  },
  toggle: { ...type.caption, color: colors.saffronDeep },
  hint: { ...type.small, color: colors.muted },
});
