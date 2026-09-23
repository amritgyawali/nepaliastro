import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { formatMoney } from '@/config/format';
import { Avatar, PrimaryButton, Screen, Tappable } from '@/components';
import { findAstrologer } from '@/data/astrologers';
import { Phone } from '@/icons';
import { GUTTER, colors, font, radius, space, type } from '@/theme';

/** How long the call spends ringing before the astrologer picks up. */
const RINGING_MS = 2600;

function formatElapsed(totalSeconds: number): string {
  const minutes = `${Math.floor(totalSeconds / 60)}`.padStart(2, '0');
  const seconds = `${totalSeconds % 60}`.padStart(2, '0');
  return `${minutes}:${seconds}`;
}

type CallState = 'ringing' | 'connected' | 'ended';

/** The voice consultation: ringing, connected with the meter running, ended. */
export default function CallScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const astrologer = findAstrologer(id ?? '');

  const [state, setState] = useState<CallState>('ringing');
  const [elapsed, setElapsed] = useState(0);
  const [muted, setMuted] = useState(false);
  const [speaker, setSpeaker] = useState(false);

  const rate = astrologer?.discountedRate ?? astrologer?.rate ?? 0;
  const cost = ((elapsed / 60) * rate).toFixed(2);

  useEffect(() => {
    const timer = setTimeout(() => setState('connected'), RINGING_MS);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (state !== 'connected') return;
    const tick = setInterval(() => setElapsed((seconds) => seconds + 1), 1000);
    return () => clearInterval(tick);
  }, [state]);

  const leave = useCallback(() => {
    if (router.canGoBack()) router.back();
    else router.replace('/(tabs)/call');
  }, [router]);

  if (!astrologer) {
    return (
      <Screen background={colors.ink}>
        <View style={styles.root}>
          <Text style={styles.name}>Astrologer not found</Text>
          <PrimaryButton label="Back" onPress={leave} style={styles.endedCta} />
        </View>
      </Screen>
    );
  }

  if (state === 'ended') {
    return (
      <Screen background={colors.white}>
        <View style={styles.summary}>
          <Text style={styles.summaryTitle}>Call ended</Text>
          <Text style={styles.summaryBody}>
            {formatElapsed(elapsed)} with {astrologer.name}, at {formatMoney(rate)} a
            minute.
          </Text>

          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Duration</Text>
              <Text style={styles.summaryValue}>{formatElapsed(elapsed)}</Text>
            </View>
            <View style={[styles.summaryRow, styles.summaryDivider]}>
              <Text style={styles.summaryLabel}>Charged</Text>
              <Text style={styles.summaryValue}>{formatMoney(Number(cost))}</Text>
            </View>
          </View>

          <View style={styles.summaryActions}>
            <PrimaryButton
              label="Continue in chat"
              onPress={() => router.replace(`/chat/${astrologer.id}`)}
            />
            <PrimaryButton label="Done" variant="outline" onPress={leave} />
          </View>
        </View>
      </Screen>
    );
  }

  return (
    <Screen background={colors.ink} edges={['top', 'bottom']}>
      <View style={styles.root}>
        <View style={styles.who}>
          <Avatar uri={astrologer.photo} name={astrologer.name} size={120} />
          <Text style={styles.name}>{astrologer.name}</Text>
          <Text style={styles.status}>
            {state === 'ringing' ? 'Calling…' : formatElapsed(elapsed)}
          </Text>
          <Text style={styles.rate}>
            {state === 'ringing'
              ? `${formatMoney(rate)} a minute once connected`
              : `${formatMoney(Number(cost))} so far`}
          </Text>
        </View>

        <View style={styles.controls}>
          <Toggle
            label="Mute"
            active={muted}
            onPress={() => setMuted((current) => !current)}
          />
          <Toggle
            label="Speaker"
            active={speaker}
            onPress={() => setSpeaker((current) => !current)}
          />
        </View>

        <Tappable
          accessibilityRole="button"
          accessibilityLabel="End call"
          onPress={() => setState('ended')}
          style={styles.end}
          hoveredStyle={styles.endPressed}
          pressedStyle={styles.endPressed}
        >
          <Phone size={26} color={colors.white} filled />
        </Tappable>
        <Text style={styles.endLabel}>End call</Text>
      </View>
    </Screen>
  );
}

function Toggle({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Tappable
      accessibilityRole="switch"
      accessibilityState={{ checked: active }}
      accessibilityLabel={label}
      onPress={onPress}
      style={[styles.toggle, active && styles.toggleActive]}
      hoveredStyle={styles.togglePressed}
      pressedStyle={styles.togglePressed}
    >
      <Text style={[styles.toggleLabel, active && styles.toggleLabelActive]}>
        {label}
      </Text>
      <Text style={[styles.toggleState, active && styles.toggleLabelActive]}>
        {active ? 'On' : 'Off'}
      </Text>
    </Tappable>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: GUTTER,
    paddingTop: space.xxl,
    paddingBottom: space.xl,
  },
  who: {
    alignItems: 'center',
    gap: space.sm,
  },
  name: {
    ...type.title,
    color: colors.white,
    marginTop: space.lg,
  },
  status: {
    ...type.section,
    color: colors.saffron,
    fontVariant: ['tabular-nums'],
  },
  rate: {
    ...type.caption,
    color: colors.subtle,
  },
  controls: {
    flexDirection: 'row',
    gap: space.md,
  },
  toggle: {
    width: 104,
    alignItems: 'center',
    gap: 2,
    paddingVertical: space.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  toggleActive: {
    backgroundColor: colors.saffron,
    borderColor: colors.saffron,
  },
  togglePressed: {
    opacity: 0.7,
  },
  toggleLabel: {
    ...type.label,
    color: colors.white,
  },
  toggleState: {
    ...type.caption,
    color: colors.subtle,
  },
  toggleLabelActive: {
    color: colors.onSaffron,
  },
  end: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.red,
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ rotate: '135deg' }],
  },
  endPressed: {
    opacity: 0.8,
  },
  endLabel: {
    ...type.caption,
    color: colors.subtle,
    marginTop: space.sm,
  },
  endedCta: {
    alignSelf: 'stretch',
    marginTop: space.xl,
  },

  summary: {
    flex: 1,
    paddingHorizontal: GUTTER,
    paddingTop: space.xxl,
  },
  summaryTitle: {
    ...type.display,
    color: colors.ink,
  },
  summaryBody: {
    ...type.body,
    color: colors.muted,
    marginTop: space.xs,
  },
  summaryCard: {
    marginTop: space.xl,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: space.lg,
    paddingVertical: space.md,
  },
  summaryDivider: {
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  summaryLabel: {
    ...type.small,
    color: colors.muted,
  },
  summaryValue: {
    fontFamily: font.semibold,
    fontSize: 15,
    lineHeight: 21,
    color: colors.ink,
    fontVariant: ['tabular-nums'],
  },
  summaryActions: {
    marginTop: space.xl,
    gap: space.md,
  },
});
