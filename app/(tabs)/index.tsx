import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Platform, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';

import {
  AstrologerRail,
  DailyInsightCard,
  HomeHeader,
  NextReadingCard,
  QuickCategories,
  Reveal,
  Screen,
  SearchResults,
  TodayPanchang,
} from '@/components';
import {
  callAstrologers,
  chatAstrologers,
  featuredAstrologers,
  type Astrologer,
} from '@/data/astrologers';
import {
  chartFor, formatShortDay, greetingFor, panchangFor, placeOf, rashifalFor,
} from '@/lib/jyotish';
import { useOnboarding } from '@/store/onboarding';
import { usePredictions } from '@/store/predictions';
import { colors, space } from '@/theme';

/** How long the greeting is allowed to go stale. */
const CLOCK_TICK_MS = 60_000;

/** Home tab: today's reading first, then the people you can ask about it. */
export default function HomeScreen() {
  const router = useRouter();
  const { profile } = useOnboarding();
  const { current: prediction, upcoming } = usePredictions();

  const scrollRef = useRef<ScrollView>(null);
  const refreshTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [query, setQuery] = useState('');
  const [now, setNow] = useState(() => new Date());
  const [refreshing, setRefreshing] = useState(false);

  /* ---------------------------------------------------------------- *
   * Everything on the page hangs off the clock, so it is state rather
   * than a bare `new Date()` — a pull to refresh and the minute tick
   * both work by replacing it.
   * ---------------------------------------------------------------- */
  useEffect(() => {
    const tick = setInterval(() => setNow(new Date()), CLOCK_TICK_MS);
    return () => clearInterval(tick);
  }, []);

  useEffect(
    () => () => {
      if (refreshTimer.current) clearTimeout(refreshTimer.current);
    },
    [],
  );

  // Vedic astrology reads a person by their moon sign, not their sun sign, so
  // the card opens on the chart's rashi and falls back to Mesha before any
  // birth date has been given.
  const chart = useMemo(() => chartFor(profile), [profile]);
  const reading = useMemo(
    () => rashifalFor(chart?.rashi.index ?? 0, 'daily', now),
    [chart, now],
  );
  const panchang = useMemo(() => panchangFor(now, placeOf(profile)), [now, profile]);
  const dateLabel = useMemo(() => formatShortDay(now), [now]);

  const greeting = useMemo(() => {
    const base = greetingFor(now);
    const first = profile.name.trim().split(/\s+/)[0];
    return first ? `${base}, ${first}` : base;
  }, [now, profile.name]);

  const contextLine = `${dateLabel} · ${panchang.tithi.paksha} ${panchang.tithi.name}`;

  /* ---------------------------------------------------------------- *
   * Search
   * ---------------------------------------------------------------- */

  /** Every astrologer the app knows, with the duplicate listings folded in. */
  const everyone = useMemo(() => {
    const seen = new Set<string>();
    return [...featuredAstrologers, ...chatAstrologers, ...callAstrologers].filter(
      (astrologer) => {
        const key = astrologer.name.toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      },
    );
  }, []);

  const needle = query.trim().toLowerCase();
  const searching = needle.length > 0;

  const results = useMemo(() => {
    if (!searching) return [];
    return everyone.filter(
      (astrologer) =>
        astrologer.name.toLowerCase().includes(needle) ||
        astrologer.skills.toLowerCase().includes(needle) ||
        astrologer.languages.toLowerCase().includes(needle),
    );
  }, [everyone, needle, searching]);

  const availableNow = useMemo(
    () => everyone.filter((astrologer) => astrologer.online),
    [everyone],
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // The reading, the greeting and the panchang are all functions of the
    // date, so re-reading the clock is the whole of the refresh.
    setNow(new Date());
    if (refreshTimer.current) clearTimeout(refreshTimer.current);
    refreshTimer.current = setTimeout(() => setRefreshing(false), 500);
  }, []);

  /* ---------------------------------------------------------------- *
   * Navigation
   * ---------------------------------------------------------------- */

  /** Tapping a card opens the astrologer; the button on it starts the session. */
  const openAstrologer = (astrologer: Astrologer) =>
    router.push(`/astrologer/${astrologer.id}`);

  const openCategory = (id: string) => {
    switch (id) {
      case 'daily-horoscope':
        router.push('/horoscope');
        break;
      case 'patro':
        router.push('/patro');
        break;
      case 'sait':
        router.push('/muhurta');
        break;
      case 'free-kundli':
        router.push('/kundli');
        break;
      default:
        router.push('/(tabs)/services');
    }
  };

  return (
    <Screen background={colors.white}>
      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        // Dragging the results dismisses the keyboard — but react-native-web
        // implements that by blurring on *every* scroll event, programmatic
        // ones included, and there is no soft keyboard to dismiss there.
        keyboardDismissMode={Platform.OS === 'web' ? 'none' : 'on-drag'}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.muted}
            colors={[colors.saffron]}
          />
        }
      >
        <HomeHeader
          greeting={greeting}
          contextLine={contextLine}
          query={query}
          onQueryChange={setQuery}
        />

        {searching ? (
          <SearchResults
            query={query.trim()}
            results={results}
            onSelect={openAstrologer}
            onAction={(astrologer) => router.push(`/chat/${astrologer.id}`)}
            onClear={() => setQuery('')}
          />
        ) : (
          <View>
            <Reveal index={0}>
              <QuickCategories onSelect={openCategory} />
            </Reveal>

            {prediction ? (
              <Reveal index={1} style={styles.reading}>
                <NextReadingCard
                  reading={prediction}
                  next={upcoming[0]}
                  now={now}
                  onOpen={() => router.push(`/prediction/${prediction.id}`)}
                  onSeeAll={() => router.push('/predictions')}
                />
              </Reveal>
            ) : null}

            <Reveal index={2} style={styles.reading}>
              <DailyInsightCard
                reading={reading}
                dateLabel={dateLabel}
                onOpen={() => router.push('/horoscope')}
              />
            </Reveal>

            <Reveal index={3}>
              <AstrologerRail
                title="Available now"
                data={availableNow}
                onViewAll={() => router.push('/(tabs)/chat')}
                onSelect={openAstrologer}
                onAction={(astrologer) => router.push(`/chat/${astrologer.id}`)}
              />
            </Reveal>

            <Reveal index={4}>
              <TodayPanchang
                panchang={panchang}
                dateLabel={dateLabel}
                onSeeAll={() => router.push('/panchang')}
              />
            </Reveal>

            <AstrologerRail
              title="Book a call"
              data={callAstrologers}
              mode="call"
              onViewAll={() => router.push('/(tabs)/call')}
              onSelect={openAstrologer}
              onAction={(astrologer) => router.push(`/call/${astrologer.id}`)}
            />
          </View>
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: space.xxl,
  },
  reading: {
    marginTop: space.lg,
  },
});
