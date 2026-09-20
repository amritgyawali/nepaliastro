import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import {
  FreeMinuteOffer,
  NavHeader,
  PrimaryButton,
  Screen,
  Stepper,
  WheelColumn,
  WheelPicker,
} from '@/components';
import { topNearbyAstrologer } from '@/data/astrologers';
import { Check } from '@/icons';
import { colors, fontFamily, weight } from '@/theme';
import { useOnboarding } from '@/store/onboarding';

/** Step 4 — "Enter your birth time" */
export default function BirthTimeStep() {
  const router = useRouter();
  const { profile, update } = useOnboarding();
  const time = profile.birthTime ?? { hour: 12, minute: 0, period: 'AM' as const };
  const unknown = profile.birthTimeUnknown;

  // Birth date and time are all the chart needs, so the free-minute offer is
  // raised here rather than at the end of the questionnaire.
  const [offerVisible, setOfferVisible] = useState(false);

  /** Claim — straight into the live chat, where the free minute starts. */
  const claimOffer = () => {
    setOfferVisible(false);
    update({ freeMinuteClaimed: true, completed: true });
    router.replace(`/chat/${topNearbyAstrologer.id}?free=1`);
  };

  /** Cancel — no offer claimed, the user lands on the home screen. */
  const declineOffer = () => {
    setOfferVisible(false);
    update({ freeMinuteClaimed: false, completed: true });
    router.replace('/(tabs)');
  };

  const hourOptions = useMemo(
    () => Array.from({ length: 12 }, (_, i) => ({ label: `${i + 1}`, value: i + 1 })),
    [],
  );
  const minuteOptions = useMemo(
    () =>
      Array.from({ length: 60 }, (_, i) => ({
        label: `${i}`.padStart(2, '0'),
        value: i,
      })),
    [],
  );
  const periodOptions = useMemo(
    () => [
      { label: 'AM', value: 'AM' },
      { label: 'PM', value: 'PM' },
    ],
    [],
  );

  const setPart = (patch: Partial<typeof time>) => {
    update({ birthTime: { ...time, ...patch } });
  };

  return (
    <Screen background={colors.white}>
      <NavHeader title="Enter your details" bordered />

      <View style={styles.body}>
        <View style={styles.content}>
          <Stepper current="birth-time" />

          <Text style={styles.heading}>Enter your birth time</Text>

          <WheelPicker disabled={unknown}>
            <WheelColumn
              options={hourOptions}
              value={time.hour}
              onChange={(hour) => setPart({ hour: hour as number })}
            />
            <WheelColumn
              options={minuteOptions}
              value={time.minute}
              onChange={(minute) => setPart({ minute: minute as number })}
            />
            <WheelColumn
              options={periodOptions}
              value={time.period}
              onChange={(period) => setPart({ period: period as 'AM' | 'PM' })}
            />
          </WheelPicker>

          <Pressable
            accessibilityRole="checkbox"
            accessibilityState={{ checked: unknown }}
            onPress={() => update({ birthTimeUnknown: !unknown })}
            style={styles.checkboxRow}
          >
            <View style={[styles.checkbox, unknown && styles.checkboxOn]}>
              {unknown ? <Check size={13} color="#1E201E" strokeWidth={3.4} /> : null}
            </View>
            <Text style={styles.checkboxLabel}>Don&rsquo;t know my exact time of birth</Text>
          </Pressable>

          <Text style={styles.note}>
            Note: Without time of birth, we can still achieve upto 80% accurate predictions
          </Text>

          <PrimaryButton
            label="Next"
            onPress={() => setOfferVisible(true)}
            style={styles.cta}
          />
        </View>
      </View>

      <FreeMinuteOffer
        visible={offerVisible}
        onClaim={claimOffer}
        onCancel={declineOffer}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
    backgroundColor: colors.cream,
  },
  content: {
    flex: 1,
    paddingHorizontal: 22,
    paddingTop: 20,
  },
  heading: {
    fontFamily,
    fontSize: 30,
    lineHeight: 36,
    fontWeight: weight.medium,
    letterSpacing: -0.6,
    color: '#4B5563',
    marginTop: 36,
    marginBottom: 12,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 26,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1.6,
    borderColor: '#383B38',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxOn: {
    backgroundColor: '#EFCA38',
    borderColor: '#D9B62E',
  },
  checkboxLabel: {
    fontFamily,
    fontSize: 15.5,
    fontWeight: weight.medium,
    color: '#1E201E',
  },
  note: {
    fontFamily,
    fontSize: 14,
    lineHeight: 21,
    color: '#585C57',
    marginTop: 12,
  },
  cta: {
    marginTop: 24,
  },
});
