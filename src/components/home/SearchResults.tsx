import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import type { Astrologer } from '@/data/astrologers';
import { Search } from '@/icons';
import { colors, fontFamily, radius, weight } from '@/theme';

import { AstrologerCard } from '../AstrologerCard';
import { PressableScale } from '../PressableScale';

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
 * Browsing and searching are different jobs, so the rails give way entirely
 * rather than being filtered in place — otherwise a search that matches one
 * astrologer leaves four near-empty carousels behind it.
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
        <View style={styles.emptyCircle}>
          <Search size={26} color="#9AA0A6" strokeWidth={2} />
        </View>
        <Text style={styles.emptyTitle}>No astrologers match “{query}”</Text>
        <Text style={styles.emptyBody}>
          Try a name, a practice such as Tarot or Vedic, or a language you would
          like to be read in.
        </Text>
        <PressableScale
          accessibilityRole="button"
          accessibilityLabel="Clear search"
          onPress={onClear}
          scaleTo={0.96}
          style={styles.clearButton}
        >
          <Text style={styles.clearLabel}>Clear search</Text>
        </PressableScale>
      </View>
    );
  }

  return (
    <View style={styles.list}>
      <Text style={styles.count}>
        {results.length} {results.length === 1 ? 'astrologer' : 'astrologers'} for “
        {query}”
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
    paddingHorizontal: 14,
    paddingTop: 14,
    gap: 12,
  },
  count: {
    fontFamily,
    fontSize: 13,
    fontWeight: weight.medium,
    color: colors.muted,
    paddingHorizontal: 2,
  },
  empty: {
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingTop: 48,
    paddingBottom: 24,
  },
  emptyCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: colors.sheet,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontFamily,
    fontSize: 16,
    lineHeight: 21,
    fontWeight: weight.semibold,
    letterSpacing: -0.2,
    color: colors.inkStrong,
    textAlign: 'center',
    marginTop: 16,
  },
  emptyBody: {
    fontFamily,
    fontSize: 13.5,
    lineHeight: 19,
    color: colors.muted,
    textAlign: 'center',
    marginTop: 6,
  },
  clearButton: {
    marginTop: 18,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: radius.pill,
    backgroundColor: colors.yellow,
  },
  clearLabel: {
    fontFamily,
    fontSize: 14,
    fontWeight: weight.semibold,
    color: '#26262A',
  },
});
