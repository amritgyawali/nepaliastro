import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { PageHeader, Photo, Reveal, Screen, Tappable } from '@/components';
import { remedyServices } from '@/data/content';
import { ArrowRight } from '@/icons';
import { GUTTER, colors, radius, space, type } from '@/theme';

/**
 * Remedies tab: the things you can arrange, one card each.
 *
 * Each card leads with a photograph of the thing itself — the thali, the
 * mala, the bowl — because a remedy is a physical object or a ritual, and a
 * picture of it says what it is faster than the title does.
 */
export default function RemediesScreen() {
  const router = useRouter();

  return (
    <Screen background={colors.white}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <PageHeader
          title="Remedies"
          subtitle="Poojas, gemstones and healing sessions"
        />

        <View style={styles.list}>
          {remedyServices.map((service, index) => (
            <Reveal key={service.id} index={index}>
              <Tappable
                feel="card"
                accessibilityRole="button"
                accessibilityLabel={`${service.title}. ${service.description}`}
                onPress={() => router.push(`/remedy/${service.id}`)}
                style={styles.card}
                hoveredStyle={styles.cardHovered}
              >
                <Photo scene={service.image} height={148} style={styles.image} />

                <View style={styles.cardText}>
                  <View style={styles.titleRow}>
                    <Text style={styles.cardTitle}>{service.title}</Text>
                    <Text style={styles.price}>from USD {service.price}</Text>
                  </View>
                  <Text style={styles.cardBody}>{service.description}</Text>
                  <View style={styles.cue}>
                    <Text style={styles.cueLabel}>See what it includes</Text>
                    <ArrowRight size={14} color={colors.saffronDeep} strokeWidth={2.2} />
                  </View>
                </View>
              </Tappable>
            </Reveal>
          ))}
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: space.xxl,
  },
  list: {
    paddingHorizontal: GUTTER,
    gap: space.lg,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  cardHovered: {
    borderColor: colors.saffronBorder,
  },
  image: {
    borderRadius: 0,
  },
  cardText: {
    padding: space.lg,
    gap: 2,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: space.md,
  },
  cardTitle: {
    ...type.section,
    color: colors.ink,
    flexShrink: 1,
  },
  price: {
    ...type.caption,
    color: colors.muted,
  },
  cardBody: {
    ...type.small,
    color: colors.muted,
  },
  cue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: space.sm,
  },
  cueLabel: {
    ...type.label,
    color: colors.saffronDeep,
  },
});
