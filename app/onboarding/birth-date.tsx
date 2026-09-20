import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import {
  NavHeader,
  PrimaryButton,
  Screen,
  Stepper,
  WheelColumn,
  WheelPicker,
} from '@/components';
import { GUTTER, colors, space, type } from '@/theme';
import { useOnboarding } from '@/store/onboarding';

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const CURRENT_YEAR = new Date().getFullYear();
const FIRST_YEAR = CURRENT_YEAR - 100;

function daysInMonth(month: number, year: number): number {
  return new Date(year, month, 0).getDate();
}

/** Step 3 — "Enter your birth date" */
export default function BirthDateStep() {
  const router = useRouter();
  const { profile, update } = useOnboarding();
  const date = profile.birthDate ?? { day: 1, month: 1, year: 2000 };

  const dayOptions = useMemo(() => {
    const total = daysInMonth(date.month, date.year);
    return Array.from({ length: total }, (_, i) => ({ label: `${i + 1}`, value: i + 1 }));
  }, [date.month, date.year]);

  const monthOptions = useMemo(
    () => MONTHS.map((label, i) => ({ label, value: i + 1 })),
    [],
  );

  const yearOptions = useMemo(
    () =>
      Array.from({ length: CURRENT_YEAR - FIRST_YEAR + 1 }, (_, i) => ({
        label: `${FIRST_YEAR + i}`,
        value: FIRST_YEAR + i,
      })),
    [],
  );

  /** Keeps 31 Jan → Feb from producing an impossible date. */
  const setPart = (patch: Partial<typeof date>) => {
    const next = { ...date, ...patch };
    const max = daysInMonth(next.month, next.year);
    update({ birthDate: { ...next, day: Math.min(next.day, max) } });
  };

  return (
    <Screen background={colors.white}>
      <NavHeader title="Your details" bordered />

      <View style={styles.content}>
        <View style={styles.inner}>
          <Stepper current="birth-date" />

          <Text style={styles.heading}>When were you born?</Text>

          <WheelPicker>
            <WheelColumn
              options={dayOptions}
              value={date.day}
              onChange={(day) => setPart({ day: day as number })}
            />
            <WheelColumn
              options={monthOptions}
              value={date.month}
              flex={1.6}
              onChange={(month) => setPart({ month: month as number })}
            />
            <WheelColumn
              options={yearOptions}
              value={date.year}
              flex={1.1}
              onChange={(year) => setPart({ year: year as number })}
            />
          </WheelPicker>

          <View style={styles.spacer} />

          <PrimaryButton
            label="Continue"
            onPress={() => router.push('/onboarding/birth-time')}
          />
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
  inner: {
    flex: 1,
    paddingHorizontal: GUTTER,
    paddingTop: space.xl,
    paddingBottom: space.xl,
  },
  heading: {
    ...type.display,
    color: colors.ink,
    marginTop: space.xl,
    marginBottom: space.lg,
  },
  spacer: {
    flex: 1,
    minHeight: space.xl,
  },
});
