import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Card, NavHeader, PrimaryButton, ScoreBar, Screen, Tag, Tappable } from '@/components';
import {
  TOPICS, formatClock, formatGregorian, placeOf, prashnaFor,
  type PrashnaReading, type QuestionTopic,
} from '@/lib/jyotish';
import { useOnboarding } from '@/store/onboarding';
import { GUTTER, colors, radius, space, type } from '@/theme';

const TONE: Record<PrashnaReading['leaning'], 'good' | 'bad' | 'neutral' | 'accent'> = {
  yes: 'good', likely: 'accent', unclear: 'neutral', unlikely: 'neutral', no: 'bad',
};

const HEADLINE: Record<PrashnaReading['leaning'], string> = {
  yes: 'Yes',
  likely: 'Leaning yes',
  unclear: 'Genuinely unclear',
  unlikely: 'Leaning no',
  no: 'No',
};

/**
 * Prashna — the question, answered from the moment it was asked.
 *
 * Horary needs no birth details, which makes it the one reading available to
 * someone who does not know when they were born. In Nepal that is a great
 * many people — older women especially, whose births were never registered —
 * and it is the reason this screen asks for nothing at all.
 */
export default function PrashnaScreen() {
  const { profile } = useOnboarding();
  const place = useMemo(() => placeOf(profile), [profile]);

  const [topic, setTopic] = useState<QuestionTopic | null>(null);
  const [reading, setReading] = useState<PrashnaReading | null>(null);

  const ask = () => {
    if (!topic) return;
    // The chart is cast for the instant the button is pressed — that is the
    // whole method, so it is read now rather than from any stored moment.
    setReading(prashnaFor(topic, new Date(), place));
  };

  return (
    <Screen>
      <NavHeader title="Prashna" bordered />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {reading ? (
          <>
            <Card accent style={styles.card}>
              <Text style={styles.askedLabel}>
                Asked {formatClock(reading.askedAt)}, {formatGregorian(reading.askedAt)}
              </Text>
              <Text style={styles.question}>{reading.topic.label}</Text>
              <View style={styles.verdictRow}>
                <Text style={styles.verdict}>{HEADLINE[reading.leaning]}</Text>
                <Tag label={`${reading.confidence}% clear`} tone={TONE[reading.leaning]} />
              </View>
              <View style={styles.bar}>
                <ScoreBar value={reading.confidence} neutral caption="How strongly the chart leans" />
              </View>
            </Card>

            <Card title="The chart at that moment" style={styles.card}>
              <Text style={styles.body}>
                {reading.lagna} was rising. The moon — which stands for your own mind —
                was in {reading.moon.rashi}, the {reading.moon.house}th house, crossing{' '}
                {reading.moon.nakshatra}.
              </Text>
            </Card>

            <Card title="Why" style={styles.card}>
              {reading.reasons.map((reason, i) => (
                <Text key={i} style={styles.reason}>• {reason}</Text>
              ))}
            </Card>

            <Card title="When" style={styles.card}>
              <Text style={styles.body}>{reading.timing}</Text>
            </Card>

            <Card style={styles.card}>
              <Text style={styles.caution}>{reading.caution}</Text>
            </Card>

            <PrimaryButton
              label="Ask something else"
              variant="outline"
              onPress={() => {
                setReading(null);
                setTopic(null);
              }}
              style={styles.cta}
            />
          </>
        ) : (
          <>
            <Text style={styles.intro}>
              Prashna answers one question from the sky at the moment you ask it. It needs
              no birth date and no birth time — only the question, and that you mean it.
            </Text>

            <Text style={styles.pick}>What is it about?</Text>

            <View style={styles.topics}>
              {TOPICS.map((option) => {
                const selected = topic?.id === option.id;
                return (
                  <Tappable
                    key={option.id}
                    accessibilityRole="radio"
                    accessibilityState={{ selected }}
                    accessibilityLabel={option.label}
                    onPress={() => setTopic(option)}
                    style={[styles.topic, selected && styles.topicSelected]}
                    pressedStyle={styles.pressed}
                  >
                    <Text style={[styles.topicLabel, selected && styles.topicLabelSelected]}>
                      {option.label}
                    </Text>
                    <Text style={[styles.topicNp, selected && styles.topicLabelSelected]}>
                      {option.np} · {option.house}th house
                    </Text>
                  </Tappable>
                );
              })}
            </View>

            <PrimaryButton
              label="Ask now"
              onPress={ask}
              disabled={!topic}
              style={styles.cta}
            />
            <Text style={styles.footnote}>
              Hold the question in mind and press once. Asking the same thing again an
              hour later gives a different chart, and the first answer is the one that
              counts.
            </Text>
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
  pick: { ...type.section, color: colors.ink, paddingHorizontal: GUTTER, marginTop: space.xl },
  topics: { paddingHorizontal: GUTTER, gap: space.sm, marginTop: space.md },
  topic: {
    paddingHorizontal: space.lg, paddingVertical: space.md,
    borderRadius: radius.md, borderWidth: 1, borderColor: colors.border,
  },
  topicSelected: { backgroundColor: colors.saffron, borderColor: colors.saffron },
  topicLabel: { ...type.label, color: colors.ink },
  topicLabelSelected: { color: colors.onSaffron },
  topicNp: { ...type.caption, color: colors.muted },
  pressed: { opacity: 0.6 },
  askedLabel: { ...type.caption, color: colors.saffronDeep, textTransform: 'uppercase', letterSpacing: 0.6 },
  question: { ...type.section, color: colors.body, marginTop: 2 },
  verdictRow: { flexDirection: 'row', alignItems: 'center', gap: space.md, marginTop: space.sm },
  verdict: { ...type.display, fontSize: 32, lineHeight: 40, color: colors.ink },
  bar: { marginTop: space.md },
  body: { ...type.body, color: colors.body },
  reason: { ...type.small, color: colors.body, marginBottom: space.xs },
  caution: { ...type.small, color: colors.muted },
  cta: { marginHorizontal: GUTTER, marginTop: space.xl },
  footnote: { ...type.small, color: colors.subtle, paddingHorizontal: GUTTER, marginTop: space.lg },
});
