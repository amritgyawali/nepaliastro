import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  AstrologerRail,
  ConsultCTAs,
  HomeHeader,
  PromoBanner,
  QuickCategories,
  Screen,
} from '@/components';
import { chatAstrologers, featuredAstrologers } from '@/data/astrologers';
import { TAB_BAR_HEIGHT, colors } from '@/theme';

/** Home / discovery tab — design/astrologer_app_home_discovery. */
export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');

  const bottomInset = TAB_BAR_HEIGHT + Math.max(insets.bottom, 10);

  const featured = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return featuredAstrologers;
    return featuredAstrologers.filter(
      (a) =>
        a.name.toLowerCase().includes(needle) || a.skills.toLowerCase().includes(needle),
    );
  }, [query]);

  const topRated = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return chatAstrologers;
    return chatAstrologers.filter(
      (a) =>
        a.name.toLowerCase().includes(needle) || a.skills.toLowerCase().includes(needle),
    );
  }, [query]);

  return (
    <Screen background={colors.white}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: bottomInset + 70 }}
        style={styles.scroll}
      >
        <HomeHeader balance={0} query={query} onQueryChange={setQuery} />

        <View style={styles.sheet}>
          <QuickCategories onSelect={() => router.push('/(tabs)/chat')} />

          <PromoBanner onChatNow={() => router.push('/chat/kiran')} />

          <AstrologerRail
            title="Astrologers"
            data={featured}
            onViewAll={() => router.push('/(tabs)/chat')}
            onSelect={(a) => router.push(`/chat/${a.id}`)}
            onAction={(a) => router.push(`/chat/${a.id}`)}
          />

          <AstrologerRail
            title="Astrologers"
            data={topRated}
            onViewAll={() => router.push('/(tabs)/chat')}
            onSelect={(a) => router.push(`/chat/${a.id}`)}
            onAction={(a) => router.push(`/chat/${a.id}`)}
          />
        </View>
      </ScrollView>

      <ConsultCTAs
        bottom={bottomInset + 8}
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
  sheet: {
    backgroundColor: colors.white,
  },
});
