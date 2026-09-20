import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import type { Astrologer, Speciality } from '@/data/astrologers';
import { ongoingSession } from '@/data/astrologers';
import { GUTTER, colors, space, type } from '@/theme';

import { AstrologerCard } from './AstrologerCard';
import { FilterChips } from './FilterChips';
import { PageHeader } from './PageHeader';
import { Screen } from './Screen';
import { SessionPill } from './SessionPill';

type DirectoryScreenProps = {
  mode: 'chat' | 'call';
  data: Astrologer[];
};

const COPY = {
  chat: { title: 'Chat', subtitle: 'Message an astrologer, minute by minute' },
  call: { title: 'Call', subtitle: 'Speak to an astrologer, minute by minute' },
} as const;

/**
 * Shared shell for the Chat and Call directories: the same list with a
 * different action on each row.
 */
export function DirectoryScreen({ mode, data }: DirectoryScreenProps) {
  const router = useRouter();
  const [filter, setFilter] = useState<Speciality>('all');

  const visible = useMemo(
    () => (filter === 'all' ? data : data.filter((a) => a.specialities.includes(filter))),
    [data, filter],
  );

  const openAstrologer = (astrologer: Astrologer) => {
    router.push(`/chat/${astrologer.id}`);
  };

  return (
    <Screen background={colors.white}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        style={styles.scroll}
      >
        <PageHeader title={COPY[mode].title} subtitle={COPY[mode].subtitle} />

        <View style={styles.session}>
          <SessionPill onResume={() => router.push(`/chat/${ongoingSession.id}`)} />
        </View>

        <FilterChips value={filter} onChange={setFilter} />

        <View style={styles.list}>
          {visible.length === 0 ? (
            <Text style={styles.empty}>No astrologers in this speciality yet.</Text>
          ) : (
            visible.map((astrologer) => (
              <AstrologerCard
                key={astrologer.id}
                astrologer={astrologer}
                mode={mode}
                onPress={() => openAstrologer(astrologer)}
                onAction={() => openAstrologer(astrologer)}
              />
            ))
          )}
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  content: {
    paddingBottom: space.xxl,
  },
  session: {
    paddingHorizontal: GUTTER,
    paddingBottom: space.lg,
  },
  list: {
    paddingHorizontal: GUTTER,
    gap: space.md,
  },
  empty: {
    ...type.body,
    color: colors.muted,
    paddingVertical: space.xl,
  },
});
