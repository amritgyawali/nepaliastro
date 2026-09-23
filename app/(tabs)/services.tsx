import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { Card, PageHeader, Reveal, Screen, ServiceIcon, Tag, Tappable } from '@/components';
import { t } from '@/config/strings';
import {
  SERVICES, SERVICE_GROUPS, searchServices, servicesInGroup, type Service,
} from '@/data/services';
import { Search } from '@/icons';
import { chartFor } from '@/lib/jyotish';
import { useOnboarding } from '@/store/onboarding';
import { GUTTER, colors, radius, space, type } from '@/theme';

/**
 * Everything the app can do, on one screen.
 *
 * Twenty services is too many for a home screen and too many for a menu, so
 * they are grouped the way people ask for them — what they check daily, what
 * comes from their chart, questions about timing, and remedies. A service
 * that needs birth details it does not have says so on the card, before it
 * is opened, rather than after.
 */
export default function ServicesScreen() {
  const router = useRouter();
  const { profile } = useOnboarding();
  const [query, setQuery] = useState('');

  const chart = useMemo(() => chartFor(profile), [profile]);
  const hasBirth = !!profile.birthDate;
  const hasTime = hasBirth && !profile.birthTimeUnknown;

  const results = query.trim() ? searchServices(query) : null;

  const renderCard = (service: Service) => {
    const blocked =
      (service.needsBirth && !hasBirth) || (service.needsTime && !hasTime);

    return (
      <Tappable
        feel="card"
        key={service.id}
        accessibilityRole="button"
        accessibilityLabel={`${service.name} — ${service.tagline}`}
        onPress={() => router.push(service.href as never)}
        style={styles.item}
        pressedStyle={styles.pressed}
      >
        <View style={styles.iconTile}>
          <ServiceIcon name={service.icon} size={24} color={colors.saffronDeep} strokeWidth={1.8} />
        </View>

        <View style={styles.itemText}>
          <View style={styles.itemHead}>
            <Text style={styles.itemName}>{service.name}</Text>
            <Text style={styles.itemNp}>{service.np}</Text>
          </View>
          <Text style={styles.itemTagline}>{service.tagline}</Text>
          {blocked || service.badge ? (
            <View style={styles.tagRow}>
              {service.badge ? <Tag label={service.badge} tone="accent" /> : null}
              {blocked ? (
                <Tag
                  label={service.needsTime && !hasTime ? 'Needs birth time' : 'Needs birth date'}
                  tone="neutral"
                />
              ) : null}
            </View>
          ) : null}
        </View>
      </Tappable>
    );
  };

  return (
    <Screen background={colors.white}>
      <PageHeader
        title={t('services.title')}
        subtitle={
          chart
            ? `Read for ${chart.rashi.vedic} moon, ${chart.nakshatra.name}`
            : t('services.subtitle')
        }
      />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.searchField}>
          <Search size={20} color={colors.subtle} strokeWidth={2} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder={t('services.search')}
            placeholderTextColor={colors.subtle}
            style={styles.searchInput}
            returnKeyType="search"
            accessibilityLabel="Search services"
          />
        </View>

        {results ? (
          <View style={styles.group}>
            <Text style={styles.groupTitle}>
              {results.length ? `${results.length} found` : 'Nothing matched'}
            </Text>
            <Card padded={false}>{results.map(renderCard)}</Card>
          </View>
        ) : (
          SERVICE_GROUPS.map((group, index) => (
            <Reveal key={group.id} index={index} style={styles.group}>
              <View style={styles.groupHead}>
                <Text style={styles.groupTitle}>{group.title}</Text>
                <Text style={styles.groupNp}>{group.np}</Text>
              </View>
              <Card padded={false}>{servicesInGroup(group.id).map(renderCard)}</Card>
            </Reveal>
          ))
        )}

        <Text style={styles.footnote}>
          {t('services.footnote')} {SERVICES.length} services.
        </Text>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: space.xxl },
  searchField: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    marginHorizontal: GUTTER,
    paddingHorizontal: space.md,
    height: 46,
    borderRadius: radius.md,
    backgroundColor: colors.fill,
  },
  searchInput: { flex: 1, ...type.body, color: colors.ink, padding: 0 },
  group: { marginTop: space.xl, paddingHorizontal: GUTTER },
  groupHead: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginBottom: space.md,
  },
  groupTitle: { ...type.section, color: colors.ink, marginBottom: space.md },
  groupNp: { ...type.small, color: colors.muted, marginBottom: space.md },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    paddingHorizontal: space.lg,
    paddingVertical: space.md,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  pressed: { backgroundColor: colors.fill },
  iconTile: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.saffronSoft,
    borderWidth: 1,
    borderColor: colors.saffronBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemText: { flex: 1, gap: 1 },
  itemHead: { flexDirection: 'row', alignItems: 'baseline', gap: space.sm },
  itemName: { ...type.label, color: colors.ink },
  itemNp: { ...type.caption, color: colors.subtle },
  itemTagline: { ...type.small, color: colors.muted },
  tagRow: { marginTop: space.xs, flexDirection: 'row', flexWrap: 'wrap', gap: space.xs },
  footnote: {
    ...type.small,
    color: colors.subtle,
    paddingHorizontal: GUTTER,
    marginTop: space.xl,
  },
});
