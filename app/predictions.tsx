import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';

import { NavHeader, PrimaryButton, Screen } from '@/components';
import { ChevronRight } from '@/icons';
import {
  formatCountdown,
  formatSlot,
  formatSlotTime,
  type Prediction,
} from '@/lib/predictions';
import { useOnboarding } from '@/store/onboarding';
import { usePredictions } from '@/store/predictions';
import { GUTTER, colors, radius, space, type } from '@/theme';

/** How often the countdown at the top is allowed to go stale. */
const CLOCK_TICK_MS = 30_000;

/** Every reading written for this person: the one running now, and the rest. */
export default function PredictionsScreen() {
  const router = useRouter();
  const { profile } = useOnboarding();
  const { predictions, current, upcoming, working, settings, permission, aiError, refresh } =
    usePredictions();

  const [now, setNow] = useState(() => new Date());
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const tick = setInterval(() => setNow(new Date()), CLOCK_TICK_MS);
    return () => clearInterval(tick);
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setNow(new Date());
    await refresh();
    setRefreshing(false);
  }, [refresh]);

  const open = (prediction: Prediction) => router.push(`/prediction/${prediction.id}`);

  if (!profile.birthDate) {
    return (
      <Screen background={colors.white}>
        <NavHeader title="Your predictions" bordered />
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>We need your birth details first</Text>
          <Text style={styles.emptyBody}>
            Every reading is built from your kundli, so the app needs the date, time and
            place you were born before it can write one.
          </Text>
          <PrimaryButton
            label="Add birth details"
            onPress={() => router.push('/onboarding/name')}
            style={styles.emptyCta}
          />
        </View>
      </Screen>
    );
  }

  const next = upcoming[0];
  const earlier = predictions
    .filter((prediction) => prediction.at <= now.getTime() && prediction.id !== current?.id)
    .sort((a, b) => b.at - a.at);

  return (
    <Screen background={colors.white}>
      <NavHeader
        title="Your predictions"
        bordered
        right={
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Prediction alerts"
            onPress={() => router.push('/notifications')}
            hitSlop={8}
            style={({ pressed }) => pressed && styles.pressed}
          >
            <Text style={styles.headerAction}>Alerts</Text>
          </Pressable>
        }
      />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing || working}
            onRefresh={onRefresh}
            tintColor={colors.muted}
            colors={[colors.saffron]}
          />
        }
      >
        <View style={styles.banner}>
          <Text style={styles.bannerLabel}>
            {settings.enabled ? 'Every five hours' : 'Alerts are off'}
          </Text>
          <Text style={styles.bannerValue}>
            {next
              ? `Next reading ${formatCountdown(now, new Date(next.at))}, at ${formatSlotTime(new Date(next.at))}`
              : 'Your next reading is being written'}
          </Text>
          {settings.enabled && permission === 'denied' ? (
            <Text style={styles.bannerNote}>
              Your phone is not allowing notifications yet, so the readings will wait for you
              here. Turn them on in Alerts.
            </Text>
          ) : null}
          {permission === 'unsupported' ? (
            <Text style={styles.bannerNote}>
              The browser build cannot schedule notifications; on a phone each of these
              arrives on its own.
            </Text>
          ) : null}
          {aiError ? <Text style={styles.bannerNote}>{aiError}</Text> : null}
        </View>

        {current ? (
          <>
            <Text style={styles.sectionTitle}>This window</Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Open the reading: ${current.title}`}
              onPress={() => open(current)}
              style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
            >
              <Text style={styles.cardMeta}>
                {current.phaseLabel} · {formatSlot(new Date(current.at))}
              </Text>
              <Text style={styles.cardTitle}>{current.title}</Text>
              <Text style={styles.cardBody} numberOfLines={3}>
                {current.preview}
              </Text>
              <View style={styles.cardFoot}>
                <Text style={styles.cardFocus}>{current.focus}</Text>
                <Text style={styles.cardLink}>Read in full</Text>
              </View>
            </Pressable>
          </>
        ) : null}

        {upcoming.length ? (
          <>
            <Text style={styles.sectionTitle}>Still to come</Text>
            <View style={styles.list}>
              {upcoming.map((prediction, index) => (
                <Pressable
                  key={prediction.id}
                  accessibilityRole="button"
                  accessibilityLabel={`Reading arriving at ${formatSlotTime(new Date(prediction.at))}`}
                  onPress={() => open(prediction)}
                  style={({ pressed }) => [
                    styles.row,
                    index > 0 && styles.rowDivider,
                    pressed && styles.rowPressed,
                  ]}
                >
                  <View style={styles.rowText}>
                    <Text style={styles.rowTime}>
                      {formatSlotTime(new Date(prediction.at))} · {prediction.phaseLabel}
                    </Text>
                    <Text style={styles.rowFocus} numberOfLines={1}>
                      {prediction.focus}
                    </Text>
                  </View>
                  <Text style={styles.rowWhen}>
                    {formatCountdown(now, new Date(prediction.at))}
                  </Text>
                  <ChevronRight size={18} color={colors.subtle} />
                </Pressable>
              ))}
            </View>
          </>
        ) : null}

        {earlier.length ? (
          <>
            <Text style={styles.sectionTitle}>Earlier</Text>
            <View style={styles.list}>
              {earlier.map((prediction, index) => (
                <Pressable
                  key={prediction.id}
                  accessibilityRole="button"
                  accessibilityLabel={`Open the reading: ${prediction.title}`}
                  onPress={() => open(prediction)}
                  style={({ pressed }) => [
                    styles.row,
                    index > 0 && styles.rowDivider,
                    pressed && styles.rowPressed,
                  ]}
                >
                  <View style={styles.rowText}>
                    <Text style={styles.rowTitle} numberOfLines={1}>
                      {prediction.title}
                    </Text>
                    <Text style={styles.rowFocus} numberOfLines={1}>
                      {formatSlot(new Date(prediction.at))}
                    </Text>
                  </View>
                  {prediction.readAt ? null : <View style={styles.unread} />}
                  <ChevronRight size={18} color={colors.subtle} />
                </Pressable>
              ))}
            </View>
          </>
        ) : null}

        <Text style={styles.note}>
          Readings are written from your kundli and the moon’s position right now, so no two
          people receive the same one. Pull down to write them again.
        </Text>
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
  headerAction: {
    ...type.label,
    color: colors.saffronDeep,
    paddingHorizontal: space.sm,
  },
  pressed: {
    opacity: 0.5,
  },
  banner: {
    padding: space.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.saffronSoft,
    borderWidth: 1,
    borderColor: colors.saffronBorder,
    gap: 2,
  },
  bannerLabel: {
    ...type.caption,
    color: colors.saffronDeep,
  },
  bannerValue: {
    ...type.section,
    color: colors.ink,
  },
  bannerNote: {
    ...type.small,
    color: colors.body,
    marginTop: space.xs,
  },
  sectionTitle: {
    ...type.section,
    color: colors.ink,
    marginTop: space.xl,
    marginBottom: space.sm,
  },
  card: {
    padding: space.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
  cardPressed: {
    backgroundColor: colors.fill,
  },
  cardMeta: {
    ...type.caption,
    color: colors.muted,
  },
  cardTitle: {
    ...type.title,
    color: colors.ink,
    marginTop: 2,
  },
  cardBody: {
    ...type.body,
    color: colors.body,
    marginTop: space.sm,
  },
  cardFoot: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: space.md,
    marginTop: space.md,
    paddingTop: space.md,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  cardFocus: {
    ...type.caption,
    color: colors.muted,
    flexShrink: 1,
  },
  cardLink: {
    ...type.label,
    color: colors.saffronDeep,
  },
  list: {
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    paddingHorizontal: space.lg,
    paddingVertical: space.md,
  },
  rowDivider: {
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  rowPressed: {
    backgroundColor: colors.fill,
  },
  rowText: {
    flex: 1,
  },
  rowTime: {
    ...type.label,
    color: colors.ink,
  },
  rowTitle: {
    ...type.label,
    color: colors.ink,
  },
  rowFocus: {
    ...type.small,
    color: colors.muted,
  },
  rowWhen: {
    ...type.caption,
    color: colors.muted,
  },
  unread: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.saffron,
  },
  note: {
    ...type.small,
    color: colors.muted,
    marginTop: space.xl,
  },
  empty: {
    paddingHorizontal: GUTTER,
    paddingTop: space.xxl,
  },
  emptyTitle: {
    ...type.section,
    color: colors.ink,
  },
  emptyBody: {
    ...type.body,
    color: colors.muted,
    marginTop: space.sm,
  },
  emptyCta: {
    marginTop: space.xl,
  },
});
