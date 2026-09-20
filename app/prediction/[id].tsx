import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Avatar, NavHeader, PrimaryButton, Screen } from '@/components';
import { recommendedGuru } from '@/data/astrologers';
import { formatCountdown, formatSlot, formatSlotTime, ordinal } from '@/lib/predictions';
import { usePredictions } from '@/store/predictions';
import { GUTTER, colors, radius, space, type } from '@/theme';

/**
 * One reading, in full.
 *
 * This is where a tapped notification lands: the same title the lock screen
 * showed, the whole text under it, the chart facts it was written from, and
 * the way through to an astrologer who can take it further.
 */
export default function PredictionScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { findPrediction, markRead, hydrated } = usePredictions();

  const prediction = findPrediction(id ?? '');
  const guru = useMemo(() => recommendedGuru(), []);

  const arrived = !!prediction && prediction.at <= Date.now();

  useEffect(() => {
    if (prediction && arrived && !prediction.readAt) markRead(prediction.id);
  }, [prediction, arrived, markRead]);

  if (!prediction) {
    return (
      <Screen background={colors.white}>
        <NavHeader title="Your reading" bordered />
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>
            {hydrated ? 'That reading is no longer here' : 'Opening your reading…'}
          </Text>
          <Text style={styles.emptyBody}>
            Readings are kept for a day or so, and they are cleared when the birth
            details they were written from change.
          </Text>
          <PrimaryButton
            label="See your readings"
            onPress={() => router.replace('/predictions')}
            style={styles.emptyCta}
          />
        </View>
      </Screen>
    );
  }

  const at = new Date(prediction.at);
  const paragraphs = prediction.body.split(/\n{2,}/).filter(Boolean);

  return (
    <Screen background={colors.white}>
      <NavHeader title="Your reading" bordered />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.meta}>
          {prediction.phaseLabel} reading · {formatSlot(at)}
        </Text>

        <Text style={styles.title}>{prediction.title}</Text>

        {arrived ? (
          paragraphs.map((paragraph, index) => (
            <Text key={index} style={styles.paragraph}>
              {paragraph}
            </Text>
          ))
        ) : (
          <View style={styles.locked}>
            <Text style={styles.lockedTitle}>
              This one arrives at {formatSlotTime(at)}
            </Text>
            <Text style={styles.lockedBody}>
              It is written and waiting — {formatCountdown(new Date(), at)}. We will send it
              to you, and it opens here when it does.
            </Text>
          </View>
        )}

        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Focus</Text>
            <Text style={styles.rowValue}>{prediction.focus}</Text>
          </View>
          <View style={[styles.row, styles.rowDivider]}>
            <Text style={styles.rowLabel}>Best hours in this window</Text>
            <Text style={styles.rowValue}>{prediction.window}</Text>
          </View>
          {prediction.remedy && arrived ? (
            <View style={[styles.row, styles.rowDivider]}>
              <Text style={styles.rowLabel}>Today’s remedy</Text>
              <Text style={styles.rowValue}>{prediction.remedy}</Text>
            </View>
          ) : null}
        </View>

        <Text style={styles.sectionTitle}>Written from your chart</Text>

        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Your rashi</Text>
            <Text style={styles.rowValue}>{prediction.chart.rashi}</Text>
          </View>
          <View style={[styles.row, styles.rowDivider]}>
            <Text style={styles.rowLabel}>Moon today</Text>
            <Text style={styles.rowValue}>
              {prediction.chart.nakshatra} · {prediction.chart.tithi}
            </Text>
          </View>
          <View style={[styles.row, styles.rowDivider]}>
            <Text style={styles.rowLabel}>Transit</Text>
            <Text style={styles.rowValue}>
              Your {ordinal(prediction.chart.house)} house ({prediction.chart.houseName})
            </Text>
            <Text style={styles.rowNote}>The house of {prediction.chart.houseTheme}</Text>
          </View>
        </View>

        <Text style={styles.source}>
          {prediction.source === 'ai'
            ? 'Written for you by our AI astrologer from the chart above — nobody else receives this reading.'
            : 'Composed on your device from the chart above, so it works with no connection.'}
        </Text>
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.guru}>
          <Avatar name={guru.name} uri={guru.photo} size={40} />
          <View style={styles.guruText}>
            <Text style={styles.guruName} numberOfLines={1}>
              {guru.name}
            </Text>
            <Text style={styles.guruLine} numberOfLines={1}>
              {guru.skills} · {guru.online ? 'online now' : 'usually replies quickly'}
            </Text>
          </View>
        </View>

        <PrimaryButton
          label="Talk with our astrology guru"
          onPress={() => router.push(`/chat/${guru.id}`)}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: GUTTER,
    paddingTop: space.lg,
    paddingBottom: space.xxl,
  },
  meta: {
    ...type.caption,
    color: colors.saffronDeep,
  },
  title: {
    ...type.display,
    color: colors.ink,
    marginTop: space.xs,
  },
  paragraph: {
    ...type.body,
    color: colors.body,
    marginTop: space.lg,
  },
  locked: {
    marginTop: space.lg,
    padding: space.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.saffronSoft,
    borderWidth: 1,
    borderColor: colors.saffronBorder,
  },
  lockedTitle: {
    ...type.section,
    color: colors.ink,
  },
  lockedBody: {
    ...type.small,
    color: colors.body,
    marginTop: space.xs,
  },
  card: {
    marginTop: space.xl,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  row: {
    paddingHorizontal: space.lg,
    paddingVertical: space.md,
    gap: 1,
  },
  rowDivider: {
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  rowLabel: {
    ...type.caption,
    color: colors.muted,
  },
  rowValue: {
    ...type.label,
    color: colors.ink,
  },
  rowNote: {
    ...type.small,
    color: colors.muted,
  },
  sectionTitle: {
    ...type.section,
    color: colors.ink,
    marginTop: space.xl,
  },
  source: {
    ...type.small,
    color: colors.muted,
    marginTop: space.lg,
  },
  footer: {
    paddingHorizontal: GUTTER,
    paddingTop: space.md,
    paddingBottom: space.lg,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
    backgroundColor: colors.white,
    gap: space.md,
  },
  guru: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
  },
  guruText: {
    flex: 1,
  },
  guruName: {
    ...type.label,
    color: colors.ink,
  },
  guruLine: {
    ...type.caption,
    color: colors.muted,
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
