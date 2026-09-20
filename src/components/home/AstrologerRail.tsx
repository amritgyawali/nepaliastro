import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import type { Astrologer } from '@/data/astrologers';
import { colors, fontFamily, radius, shadow, weight } from '@/theme';

import { Avatar } from '../Avatar';
import { CelebrityRibbon } from '../Badges';

type AstrologerRailProps = {
  title: string;
  data: Astrologer[];
  onViewAll?: () => void;
  onSelect?: (astrologer: Astrologer) => void;
  onAction?: (astrologer: Astrologer) => void;
};

/** "Astrologers" heading plus the horizontally scrolling card rail. */
export function AstrologerRail({
  title,
  data,
  onViewAll,
  onSelect,
  onAction,
}: AstrologerRailProps) {
  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <Pressable accessibilityRole="button" onPress={onViewAll} hitSlop={8}>
          <Text style={styles.viewAll}>View All</Text>
        </Pressable>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.rail}
      >
        {data.map((astrologer) => (
          // A View, not a Pressable: the Chat button below is interactive, and
          // nesting pressables produces nested <button> elements on web.
          <View key={astrologer.id} style={styles.card}>
            {astrologer.celebrity ? <CelebrityRibbon /> : null}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={astrologer.name}
              onPress={() => onSelect?.(astrologer)}
              style={({ pressed }) => [styles.cardBody, pressed && styles.cardPressed]}
            >
              <Avatar uri={astrologer.photo} name={astrologer.name} size={72} ring />
              <Text style={styles.name} numberOfLines={1}>
                {astrologer.name}
              </Text>
              <Text style={styles.rate}>USD {astrologer.rate}/min</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Chat with ${astrologer.name}`}
              onPress={() => onAction?.(astrologer)}
              style={({ pressed }) => [styles.chatButton, pressed && styles.chatPressed]}
            >
              <Text style={styles.chatLabel}>Chat</Text>
            </Pressable>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginTop: 14,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    marginBottom: 10,
  },
  title: {
    fontFamily,
    fontSize: 19,
    fontWeight: weight.bold,
    letterSpacing: -0.4,
    color: colors.inkStrong,
  },
  viewAll: {
    fontFamily,
    fontSize: 13.5,
    fontWeight: weight.medium,
    color: colors.muted,
  },
  rail: {
    paddingHorizontal: 14,
    gap: 12,
    paddingBottom: 4,
  },
  card: {
    width: 146,
    paddingVertical: 14,
    paddingHorizontal: 10,
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: '#EDEDEA',
    overflow: 'hidden',
    ...shadow(2, 0.04, 8),
  },
  cardBody: {
    alignSelf: 'stretch',
    alignItems: 'center',
  },
  cardPressed: {
    opacity: 0.8,
  },
  name: {
    fontFamily,
    fontSize: 15,
    fontWeight: weight.medium,
    color: colors.inkStrong,
    marginTop: 10,
    letterSpacing: -0.2,
  },
  rate: {
    fontFamily,
    fontSize: 13,
    color: colors.muted,
    marginTop: 4,
  },
  chatButton: {
    marginTop: 10,
    alignSelf: 'stretch',
    paddingVertical: 8,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: '#2D8A5A',
    alignItems: 'center',
  },
  chatPressed: {
    opacity: 0.6,
  },
  chatLabel: {
    fontFamily,
    fontSize: 14,
    fontWeight: weight.medium,
    color: colors.greenText,
  },
});
