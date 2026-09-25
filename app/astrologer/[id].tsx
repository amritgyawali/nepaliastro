import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { formatMoney } from '@/config/format';
import { Avatar, NavHeader, PrimaryButton, Screen, VerifiedBadge } from '@/components';
import { findAstrologer } from '@/data/astrologers';
import { Star } from '@/icons';
import { GUTTER, colors, radius, space, type } from '@/theme';

/** One astrologer: who they are, what they charge, and the two ways to reach them. */
export default function AstrologerScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const astrologer = findAstrologer(id ?? '');

  if (!astrologer) {
    return (
      <Screen background={colors.white}>
        <NavHeader title="Astrologer" bordered />
        <View style={styles.missing}>
          <Text style={styles.missingTitle}>We could not find that astrologer</Text>
          <Text style={styles.missingBody}>
            They may no longer be taking consultations. The directory has everyone who is.
          </Text>
          <PrimaryButton
            label="Back to the directory"
            onPress={() => router.replace('/(tabs)/chat')}
            style={styles.missingCta}
          />
        </View>
      </Screen>
    );
  }

  const rate = astrologer.discountedRate ?? astrologer.rate;
  const free = rate === 0;
  const facts = [
    {
      label: 'Experience',
      value: astrologer.ai
        ? 'An AI, not a person'
        : astrologer.experience
          ? `${astrologer.experience} years`
          : '—',
    },
    { label: 'Languages', value: astrologer.languages },
    { label: 'Practises', value: astrologer.skills },
    {
      label: 'Availability',
      value: astrologer.online ? 'Online now' : astrologer.waitTime ?? 'Busy',
    },
  ];

  return (
    <Screen background={colors.white}>
      <NavHeader title={astrologer.name} bordered />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.head}>
          <Avatar uri={astrologer.photo} name={astrologer.name} ai={astrologer.ai} size={84} />

          <View style={styles.headText}>
            <View style={styles.nameRow}>
              <Text style={styles.name} numberOfLines={1}>
                {astrologer.name}
              </Text>
              {astrologer.verified ? <VerifiedBadge size={17} /> : null}
            </View>

            <Text style={styles.skills}>{astrologer.skills}</Text>

            {astrologer.rating ? (
              <View style={styles.ratingRow}>
                <Star size={14} color={colors.saffron} filled />
                <Text style={styles.rating}>{astrologer.rating.toFixed(1)}</Text>
                {astrologer.orders ? (
                  <Text style={styles.orders}>· {astrologer.orders}</Text>
                ) : null}
              </View>
            ) : null}
          </View>
        </View>

        <View style={styles.rateCard}>
          <View>
            <Text style={styles.rateLabel}>Consultation</Text>
            <Text style={styles.rate}>
              {free ? 'Free, for as long as you like' : `${formatMoney(rate)} per minute`}
            </Text>
          </View>
          <Text style={[styles.status, astrologer.online && styles.statusOnline]}>
            {astrologer.online ? 'Online now' : astrologer.waitTime ?? 'Busy'}
          </Text>
        </View>

        {astrologer.about ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About</Text>
            <Text style={styles.about}>{astrologer.about}</Text>
          </View>
        ) : null}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Details</Text>
          <View style={styles.factCard}>
            {facts.map((fact, index) => (
              <View
                key={fact.label}
                style={[styles.factRow, index > 0 && styles.factDivider]}
              >
                <Text style={styles.factLabel}>{fact.label}</Text>
                <Text style={styles.factValue} numberOfLines={2}>
                  {fact.value}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.actions}>
          <PrimaryButton
            label={free ? 'Chat free' : `Chat · ${formatMoney(rate, undefined, { perMinute: true })}`}
            onPress={() => router.push(`/chat/${astrologer.id}`)}
          />
          {/* Baba answers in writing only — there is no voice to call. */}
          {astrologer.ai ? null : (
            <PrimaryButton
              label="Call instead"
              variant="outline"
              onPress={() => router.push(`/call/${astrologer.id}`)}
            />
          )}
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
  head: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.lg,
  },
  headText: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
  },
  name: {
    ...type.title,
    color: colors.ink,
    flexShrink: 1,
  },
  skills: {
    ...type.small,
    color: colors.muted,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.xs,
    marginTop: space.xs,
  },
  rating: {
    ...type.caption,
    color: colors.ink,
  },
  orders: {
    ...type.caption,
    color: colors.muted,
  },
  rateCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: space.md,
    marginTop: space.xl,
    padding: space.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.saffronSoft,
    borderWidth: 1,
    borderColor: colors.saffronBorder,
  },
  rateLabel: {
    ...type.caption,
    color: colors.saffronDeep,
  },
  rate: {
    ...type.section,
    color: colors.ink,
  },
  status: {
    ...type.caption,
    color: colors.muted,
  },
  statusOnline: {
    color: colors.green,
  },
  section: {
    marginTop: space.xl,
    gap: space.sm,
  },
  sectionTitle: {
    ...type.section,
    color: colors.ink,
  },
  about: {
    ...type.body,
    color: colors.body,
  },
  factCard: {
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  factRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: space.lg,
    paddingHorizontal: space.lg,
    paddingVertical: space.md,
  },
  factDivider: {
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  factLabel: {
    ...type.small,
    color: colors.muted,
  },
  factValue: {
    ...type.label,
    color: colors.ink,
    flexShrink: 1,
    textAlign: 'right',
  },
  actions: {
    marginTop: space.xl,
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
  missingBody: {
    ...type.body,
    color: colors.muted,
    marginTop: space.sm,
  },
  missingCta: {
    marginTop: space.xl,
  },
});
