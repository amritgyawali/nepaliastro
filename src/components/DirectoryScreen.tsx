import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { Astrologer, Speciality } from '@/data/astrologers';
import { ongoingSession } from '@/data/astrologers';
import { SCREEN_MAX_WIDTH, TAB_BAR_HEIGHT, colors } from '@/theme';

import { AstrologerCard } from './AstrologerCard';
import { CashbackBanner } from './CashbackBanner';
import { DirectoryHeader } from './DirectoryHeader';
import { FilterChips } from './FilterChips';
import { Screen } from './Screen';
import { SessionPill } from './SessionPill';

type DirectoryScreenProps = {
  mode: 'chat' | 'call';
  data: Astrologer[];
};

/**
 * Shared shell for the Chat and Call directories, which are the same layout
 * with a different action colour and list.
 */
export function DirectoryScreen({ mode, data }: DirectoryScreenProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [filter, setFilter] = useState<Speciality>('all');

  const bottomInset = TAB_BAR_HEIGHT + Math.max(insets.bottom, 10);

  const visible = useMemo(
    () => (filter === 'all' ? data : data.filter((a) => a.specialities.includes(filter))),
    [data, filter],
  );

  const openAstrologer = (astrologer: Astrologer) => {
    router.push(`/chat/${astrologer.id}`);
  };

  return (
    <Screen background={colors.cream}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: bottomInset + 96 }}
        style={styles.scroll}
      >
        <DirectoryHeader />

        <View style={styles.bannerWrap}>
          <CashbackBanner />
        </View>

        <FilterChips value={filter} onChange={setFilter} />

        <View style={styles.list}>
          {visible.map((astrologer) => (
            <AstrologerCard
              key={astrologer.id}
              astrologer={astrologer}
              mode={mode}
              onPress={() => openAstrologer(astrologer)}
              onAction={() => openAstrologer(astrologer)}
            />
          ))}
        </View>
      </ScrollView>

      <View style={[styles.sessionWrap, { bottom: bottomInset + 6 }]} pointerEvents="box-none">
        <View style={styles.sessionInner}>
          <SessionPill onResume={() => router.push(`/chat/${ongoingSession.id}`)} />
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  bannerWrap: {
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  list: {
    paddingHorizontal: 12,
    paddingTop: 10,
    gap: 12,
  },
  sessionWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  sessionInner: {
    width: '100%',
    maxWidth: SCREEN_MAX_WIDTH - 24,
  },
});
