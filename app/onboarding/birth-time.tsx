import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import {
  FreeMinuteOffer,
  NavHeader,
  PrimaryButton,
  Screen,
  Stepper,
  Tappable,
  WheelColumn,
  WheelPicker,
} from '@/components';
import { useShownConfig } from '@/config/store';
import { topNearbyAstrologer } from '@/data/astrologers';
import { Check } from '@/icons';
import { useOnboarding } from '@/store/onboarding';
import { GUTTER, colors, radius, space, type } from '@/theme';

/** Step 4 — birth time. */
export default function BirthTimeStep() {
  const router = useRouter();
  const { profile, update } = useOnboarding();
  const time = profile.birthTime ?? { hour: 12, minute: 0, period: 'AM' as const };
  const unknown = profile.birthTimeUnknown;

  // Birth date and time are all the chart needs, so the free-minute offer is
  // raised here rather than at the end of the questionnaire.
  const [offerVisible, setOfferVisible] = useState(false);
  const offerOn = useShownConfig().astrologers.freeMinute.enabled;

  /** Claim — straight into the live chat, where the free minute starts. */
  const claimOffer = () => {
    setOfferVisible(false);
    update({ freeMinuteClaimed: true, completed: true });
    router.replace(`/chat/${topNearbyAstrologer.id}?free=1`);
  };

  /** Decline — no offer claimed, the user lands on the home screen. */
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
      <NavHeader title="Your details" bordered />

      <View style={styles.content}>
        <Stepper current="birth-time" />

        <Text style={styles.heading}>At what time?</Text>

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

        <Tappable
          feel="card"
          accessibilityRole="checkbox"
          accessibilityState={{ checked: unknown }}
          accessibilityLabel="I do not know my exact time of birth"
          onPress={() => update({ birthTimeUnknown: !unknown })}
          style={styles.checkRow}
          pressedStyle={styles.pressed}
        >
          <View style={[styles.checkbox, unknown && styles.checkboxOn]}>
            {unknown ? <Check size={13} color={colors.onSaffron} strokeWidth={3} /> : null}
          </View>
          <Text style={styles.checkLabel}>I don’t know my exact birth time</Text>
        </Tappable>

        <Text style={styles.note}>
          Without a time, a reading is still possible — it is just less precise about
          hours and minutes.
        </Text>

        <View style={styles.spacer} />

        <PrimaryButton
          label="Continue"
          arrow
          // With the offer switched off in the dashboard, or nobody to offer
          // it with, Continue simply finishes onboarding.
          onPress={() => (offerOn && topNearbyAstrologer.id ? setOfferVisible(true) : declineOffer())}
        />
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
  content: {
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
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    marginTop: space.xl,
  },
  pressed: {
    opacity: 0.6,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: radius.sm - 2,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxOn: {
    backgroundColor: colors.saffron,
    borderColor: colors.saffron,
  },
  checkLabel: {
    ...type.label,
    color: colors.ink,
    flexShrink: 1,
  },
  note: {
    ...type.small,
    color: colors.muted,
    marginTop: space.sm,
  },
  spacer: {
    flex: 1,
    minHeight: space.xl,
  },
});
