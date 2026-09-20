import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Platform, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';

import {
  AstrologerRail,
  DailyInsightCard,
  HomeHeader,
  QuickCategories,
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
import { formatToday, greetingFor, readingFor, signForDate } from '@/lib/astro';
import { panchangFor } from '@/lib/panchang';
import { useOnboarding } from '@/store/onboarding';
import { colors, space } from '@/theme';

/** How long the greeting is allowed to go stale. */
const CLOCK_TICK_MS = 60_000;

/** Home tab: today's reading first, then the people you can ask about it. */
export default function HomeScreen() {
  const router = useRouter();
  const { profile } = useOnboarding();

  const scrollRef = useRef<ScrollView>(null);
  const readingOffset = useRef(0);
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

  const sign = useMemo(() => signForDate(profile.birthDate), [profile.birthDate]);
  const reading = useMemo(() => readingFor(sign, now), [sign, now]);
  const panchang = useMemo(() => panchangFor(now), [now]);
  const dateLabel = useMemo(() => formatToday(now), [now]);

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

  const openAstrologer = (astrologer: Astrologer) => router.push(`/chat/${astrologer.id}`);

  const openCategory = (id: string) => {
    switch (id) {
      case 'daily-horoscope':
        // The reading is already on this screen; take them to it.
        scrollRef.current?.scrollTo({ y: Math.max(readingOffset.current - 12, 0) });
        break;
      case 'remedies':
        router.push('/(tabs)/remedies');
        break;
      default:
        router.push('/(tabs)/chat');
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
            onAction={openAstrologer}
            onClear={() => setQuery('')}
          />
        ) : (
          <View>
            <QuickCategories onSelect={openCategory} />

            <View
              style={styles.reading}
              onLayout={(event) => {
                readingOffset.current = event.nativeEvent.layout.y;
              }}
            >
              <DailyInsightCard reading={reading} dateLabel={dateLabel} />
            </View>

            <AstrologerRail
              title="Available now"
              data={availableNow}
              onViewAll={() => router.push('/(tabs)/chat')}
              onSelect={openAstrologer}
              onAction={openAstrologer}
            />

            <TodayPanchang panchang={panchang} dateLabel={dateLabel} />

            <AstrologerRail
              title="Book a call"
              data={callAstrologers}
              mode="call"
              onViewAll={() => router.push('/(tabs)/call')}
              onSelect={openAstrologer}
              onAction={() => router.push('/(tabs)/call')}
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
