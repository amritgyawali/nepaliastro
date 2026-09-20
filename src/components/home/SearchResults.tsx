import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import type { Astrologer } from '@/data/astrologers';
import { GUTTER, colors, space, type } from '@/theme';

import { AstrologerCard } from '../AstrologerCard';
import { PrimaryButton } from '../PrimaryButton';

type SearchResultsProps = {
  query: string;
  results: Astrologer[];
  onSelect: (astrologer: Astrologer) => void;
  onAction: (astrologer: Astrologer) => void;
  onClear: () => void;
};

/**
 * What the feed becomes while there is a query.
 *
 * Browsing and searching are different jobs, so the rows give way entirely
 * rather than being filtered in place.
 */
export function SearchResults({
  query,
  results,
  onSelect,
  onAction,
  onClear,
}: SearchResultsProps) {
  if (results.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyTitle}>No astrologers match “{query}”</Text>
        <Text style={styles.emptyBody}>
          Try a name, a practice such as Tarot or Vedic, or a language you would like
          to be read in.
        </Text>
        <PrimaryButton
          label="Clear search"
          variant="outline"
          onPress={onClear}
          style={styles.clear}
        />
      </View>
    );
  }

  return (
    <View style={styles.list}>
      <Text style={styles.count}>
        {results.length} {results.length === 1 ? 'astrologer' : 'astrologers'} found
      </Text>

      {results.map((astrologer) => (
        <AstrologerCard
          key={astrologer.id}
          astrologer={astrologer}
          mode="chat"
          onPress={() => onSelect(astrologer)}
          onAction={() => onAction(astrologer)}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    paddingHorizontal: GUTTER,
    paddingTop: space.md,
    gap: space.md,
  },
  count: {
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
  clear: {
    marginTop: space.xl,
  },
});
