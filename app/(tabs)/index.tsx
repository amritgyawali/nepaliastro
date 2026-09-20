import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  AstrologerRail,
  ConsultCTAs,
  DailyInsightCard,
  HomeHeader,
  PromoCarousel,
  QuickCategories,
  Screen,
  SearchResults,
  StickySearchBar,
  TodayPanchang,
  TrustStrip,
} from '@/components';
import {
  callAstrologers,
  chatAstrologers,
  featuredAstrologers,
  type Astrologer,
} from '@/data/astrologers';
import type { PromoSlide } from '@/data/content';
import { useReduceMotion } from '@/hooks/useReduceMotion';
import { formatToday, greetingFor, readingFor, signForDate } from '@/lib/astro';
import { panchangFor } from '@/lib/panchang';
import { useOnboarding } from '@/store/onboarding';
import { NATIVE_DRIVER, TAB_BAR_HEIGHT, colors } from '@/theme';

/** Scroll offset at which the condensed bar takes over from the header. */
const COLLAPSE_AT = 124;
/** Movement needed before the floating CTAs dock or undock — kills jitter. */
const DOCK_THRESHOLD = 8;
/** How long the greeting is allowed to go stale. */
const CLOCK_TICK_MS = 60_000;

/** Home / discovery tab — design/astrologer_app_home_discovery. */
export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const reduceMotion = useReduceMotion();
  const { profile } = useOnboarding();

  const scrollRef = useRef<ScrollView>(null);
  const searchRef = useRef<TextInput>(null);
  const scrollY = useRef(new Animated.Value(0)).current;
  const lastOffset = useRef(0);
  const feedOffset = useRef(0);
  const insightOffset = useRef(0);
  const refreshTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const focusTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [query, setQuery] = useState('');
  const [now, setNow] = useState(() => new Date());
  const [refreshing, setRefreshing] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [ctasHidden, setCtasHidden] = useState(false);

  const bottomInset = TAB_BAR_HEIGHT + Math.max(insets.bottom, 10);

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
      if (focusTimer.current) clearTimeout(focusTimer.current);
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

  /* ---------------------------------------------------------------- *
   * Scrolling chrome
   * ---------------------------------------------------------------- */

  const handleScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
    const y = contentOffset.y;
    const delta = y - lastOffset.current;
    const atEnd = y + layoutMeasurement.height >= contentSize.height - 24;

    setCollapsed(y > COLLAPSE_AT);

    if (y <= 40 || atEnd) {
      setCtasHidden(false);
    } else if (delta > DOCK_THRESHOLD) {
      setCtasHidden(true);
    } else if (delta < -DOCK_THRESHOLD) {
      setCtasHidden(false);
    }

    lastOffset.current = y;
  }, []);

  const scrollTo = useCallback(
    (y: number) => scrollRef.current?.scrollTo({ y, animated: !reduceMotion }),
    [reduceMotion],
  );

  /**
   * Return to the top and hand the cursor to the one real search field.
   *
   * The jump is deliberately not animated: on a platform that dismisses the
   * keyboard while a scroll is in flight, focusing mid-animation blurs the
   * field again. Landing first, then focusing, is the ordering that holds
   * everywhere.
   */
  const focusSearch = useCallback(() => {
    scrollRef.current?.scrollTo({ y: 0, animated: false });
    if (focusTimer.current) clearTimeout(focusTimer.current);
    focusTimer.current = setTimeout(() => searchRef.current?.focus(), 0);
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // The reading, the greeting and the panchang are all functions of the
    // date, so re-reading the clock is the whole of the refresh.
    setNow(new Date());
    if (refreshTimer.current) clearTimeout(refreshTimer.current);
    refreshTimer.current = setTimeout(() => setRefreshing(false), 550);
  }, []);

  /* ---------------------------------------------------------------- *
   * Navigation
   * ---------------------------------------------------------------- */

  const openAstrologer = (astrologer: Astrologer) => router.push(`/chat/${astrologer.id}`);

  const openCategory = (id: string) => {
    switch (id) {
      case 'daily-horoscope':
        // The reading is already on this screen; take them to it. Both
        // offsets are relative to their own parent, so they add.
        scrollTo(Math.max(feedOffset.current + insightOffset.current - 12, 0));
        break;
      case 'gemstones':
      case 'astrology-blog':
        router.push('/(tabs)/remedies');
        break;
      default:
        router.push('/(tabs)/chat');
    }
  };

  const openPromo = (slide: PromoSlide) => {
    if (slide.target === 'chat-kiran') router.push('/chat/kiran');
    else if (slide.target === 'call') router.push('/(tabs)/call');
    else router.push('/(tabs)/chat');
  };

  return (
    <Screen background={colors.white}>
      <Animated.ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: bottomInset + 84 }}
        style={styles.scroll}
        keyboardShouldPersistTaps="handled"
        // Dragging the results dismisses the keyboard — but react-native-web
        // implements that by blurring on *every* scroll event, programmatic
        // ones included, and there is no soft keyboard to dismiss there.
        keyboardDismissMode={Platform.OS === 'web' ? 'none' : 'on-drag'}
        scrollEventThrottle={16}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
          useNativeDriver: NATIVE_DRIVER,
          listener: handleScroll,
        })}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.muted}
            colors={[colors.coinDeep]}
          />
        }
      >
        <HomeHeader
          balance={0}
          greeting={greeting}
          contextLine={contextLine}
          query={query}
          onQueryChange={setQuery}
          inputRef={searchRef}
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
          <View
            style={styles.feed}
            onLayout={(event) => {
              feedOffset.current = event.nativeEvent.layout.y;
            }}
          >
            <QuickCategories onSelect={openCategory} />

            <View
              style={styles.insight}
              onLayout={(event) => {
                insightOffset.current = event.nativeEvent.layout.y;
              }}
            >
              <DailyInsightCard reading={reading} dateLabel={dateLabel} />
            </View>

            <PromoCarousel onSelect={openPromo} />

            <AstrologerRail
              title="Available now"
              subtitle="Free to take your question right away"
              data={availableNow}
              onViewAll={() => router.push('/(tabs)/chat')}
              onSelect={openAstrologer}
              onAction={openAstrologer}
            />

            <TodayPanchang panchang={panchang} dateLabel={dateLabel} />

            <AstrologerRail
              title="Book a call"
              subtitle="Speak to an expert, minute by minute"
              data={callAstrologers}
              mode="call"
              onViewAll={() => router.push('/(tabs)/call')}
              onSelect={openAstrologer}
              onAction={() => router.push('/(tabs)/call')}
            />

            <TrustStrip />
          </View>
        )}
      </Animated.ScrollView>

      <StickySearchBar
        scrollY={scrollY}
        query={query}
        interactive={collapsed}
        onPress={focusSearch}
        onAvatarPress={() => router.push('/profile')}
      />

      <ConsultCTAs
        bottom={bottomInset + 8}
        hidden={ctasHidden}
        onChat={() => router.push('/(tabs)/chat')}
        onCall={() => router.push('/(tabs)/call')}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: colors.white,
  },
  feed: {
    backgroundColor: colors.white,
  },
  insight: {
    marginTop: 14,
  },
});
