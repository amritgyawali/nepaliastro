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
import { useOpenLink } from '@/components/CustomPageView';
import { HomeBanners, NoticeBar } from '@/components/home/HomeBanners';
import type { HomeSectionId } from '@/config/schema';
import { useShownConfig } from '@/config/store';
import {
  callAstrologers,
  chatAstrologers,
  featuredAstrologers,
  type Astrologer,
} from '@/data/astrologers';
import { quickCategories } from '@/data/content';
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
  const { home, features } = useShownConfig();

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

  const openLink = useOpenLink();

  /* ---------------------------------------------------------------- *
   * Sections, in the order the dashboard sets. Each is built only if it
   * is switched on, and the stagger follows what is actually on screen.
   * ---------------------------------------------------------------- */

  const sectionFor = (id: HomeSectionId, title: string): React.ReactNode => {
    switch (id) {
      case 'notice':
        return <NoticeBar />;
      case 'banners':
        return <HomeBanners />;
      case 'quick':
        return quickCategories.length ? <QuickCategories onSelect={(category) => openLink(category.href)} /> : null;
      case 'nextReading':
        return prediction ? (
          <View style={styles.reading}>
            <NextReadingCard
              reading={prediction}
              next={upcoming[0]}
              now={now}
              onOpen={() => router.push(`/prediction/${prediction.id}`)}
              onSeeAll={() => router.push('/predictions')}
            />
          </View>
        ) : null;
      case 'daily':
        return (
          <View style={styles.reading}>
            <DailyInsightCard reading={reading} dateLabel={dateLabel} onOpen={() => router.push('/horoscope')} />
          </View>
        );
      case 'availableNow':
        return availableNow.length ? (
          <AstrologerRail
            title={title}
            data={availableNow}
            onViewAll={() => router.push('/(tabs)/chat')}
            onSelect={openAstrologer}
            onAction={(astrologer) => router.push(`/chat/${astrologer.id}`)}
          />
        ) : null;
      case 'panchang':
        return <TodayPanchang panchang={panchang} dateLabel={dateLabel} onSeeAll={() => router.push('/panchang')} />;
      case 'bookCall':
        return callAstrologers.length ? (
          <AstrologerRail
            title={title}
            data={callAstrologers}
            mode="call"
            onViewAll={() => router.push('/(tabs)/call')}
            onSelect={openAstrologer}
            onAction={(astrologer) => router.push(`/call/${astrologer.id}`)}
          />
        ) : null;
    }
  };

  const sections = home.sections
    .filter((section) => section.visible)
    .map((section) => ({ id: section.id, node: sectionFor(section.id, section.title) }))
    .filter((section) => section.node);

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
          features.pullToRefresh ? (
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.muted}
              colors={[colors.saffron]}
            />
          ) : undefined
        }
      >
        <HomeHeader
          greeting={greeting}
          contextLine={contextLine}
          query={query}
          onQueryChange={setQuery}
          showSearch={home.showSearch}
          searchPlaceholder={home.searchPlaceholder}
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
            {sections.map((section, index) => (
              <Reveal key={section.id} index={index}>
                {section.node}
              </Reveal>
            ))}
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
