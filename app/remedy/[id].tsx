import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';

import { NavHeader, PrimaryButton, Screen } from '@/components';
import { findRemedy } from '@/data/content';
import { Check } from '@/icons';
import { GUTTER, colors, radius, space, type } from '@/theme';

/** One remedy: what it is, what it includes, and how to ask for it. */
export default function RemedyScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const remedy = findRemedy(id ?? '');

  if (!remedy) {
    return (
      <Screen background={colors.white}>
        <NavHeader title="Remedy" bordered />
        <View style={styles.missing}>
          <Text style={styles.missingTitle}>We could not find that remedy</Text>
          <PrimaryButton
            label="Back to remedies"
            onPress={() => router.replace('/(tabs)/remedies')}
            style={styles.missingCta}
          />
        </View>
      </Screen>
    );
  }

  return (
    <Screen background={colors.white}>
      <NavHeader title={remedy.title} bordered />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Image
          source={{ uri: remedy.image }}
          style={styles.image}
          resizeMode="cover"
          accessibilityLabel={remedy.title}
        />

        <Text style={styles.title}>{remedy.title}</Text>
        <Text style={styles.description}>{remedy.description}</Text>

        <View style={styles.priceCard}>
          <View>
            <Text style={styles.priceLabel}>From</Text>
            <Text style={styles.price}>USD {remedy.price}</Text>
          </View>
          <Text style={styles.lead} numberOfLines={2}>
            {remedy.lead}
          </Text>
        </View>

        <Text style={styles.sectionTitle}>What it includes</Text>

        <View style={styles.includes}>
          {remedy.includes.map((item) => (
            <View key={item} style={styles.includeRow}>
              <View style={styles.tick}>
                <Check size={12} color={colors.onSaffron} strokeWidth={3} />
              </View>
              <Text style={styles.includeText}>{item}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.note}>
          An astrologer confirms the details against your chart before anything is
          booked, so start with a chat rather than a payment.
        </Text>

        <View style={styles.actions}>
          <PrimaryButton
            label="Request this remedy"
            onPress={() => router.push('/(tabs)/chat')}
          />
          <PrimaryButton
            label="See your kundli first"
            variant="outline"
            onPress={() => router.push('/kundli')}
          />
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: GUTTER,
    paddingTop: space.lg,
    paddingBottom: space.xxl,
  },
  image: {
    width: '100%',
    height: 180,
    borderRadius: radius.lg,
    backgroundColor: colors.fill,
  },
  title: {
    ...type.display,
    color: colors.ink,
    marginTop: space.lg,
  },
  description: {
    ...type.body,
    color: colors.muted,
    marginTop: space.xs,
  },
  priceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: space.lg,
    marginTop: space.lg,
    padding: space.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.saffronSoft,
    borderWidth: 1,
    borderColor: colors.saffronBorder,
  },
  priceLabel: {
    ...type.caption,
    color: colors.saffronDeep,
  },
  price: {
    ...type.title,
    color: colors.ink,
  },
  lead: {
    ...type.small,
    color: colors.body,
    flex: 1,
    textAlign: 'right',
  },
  sectionTitle: {
    ...type.section,
    color: colors.ink,
    marginTop: space.xl,
    marginBottom: space.md,
  },
  includes: {
    gap: space.md,
  },
  includeRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: space.md,
  },
  tick: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.saffron,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  includeText: {
    ...type.body,
    color: colors.body,
    flex: 1,
  },
  note: {
    ...type.small,
    color: colors.muted,
    marginTop: space.xl,
  },
  actions: {
    marginTop: space.lg,
    gap: space.md,
  },
  missing: {
    paddingHorizontal: GUTTER,
    paddingTop: space.xxl,
  },
  missingTitle: {
    ...type.section,
    color: colors.ink,
  },
  missingCta: {
    marginTop: space.xl,
  },
});
