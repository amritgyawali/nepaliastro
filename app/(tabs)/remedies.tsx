import { useRouter } from 'expo-router';
import React from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { PageHeader, Screen } from '@/components';
import { remedyServices } from '@/data/content';
import { GUTTER, colors, radius, space, type } from '@/theme';

/** Remedies tab: the things you can arrange, one card each. */
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
          {remedyServices.map((service) => (
            <Pressable
              key={service.id}
              accessibilityRole="button"
              accessibilityLabel={`${service.title}. ${service.description}`}
              onPress={() => router.push(`/remedy/${service.id}`)}
              style={({ pressed }) => [styles.card, pressed && styles.pressed]}
            >
              <Image
                source={{ uri: service.image }}
                style={styles.image}
                resizeMode="cover"
                accessibilityLabel={service.title}
              />
              <View style={styles.cardText}>
                <Text style={styles.cardTitle}>{service.title}</Text>
                <Text style={styles.cardBody}>{service.description}</Text>
                <Text style={styles.cardAction}>See what it includes</Text>
              </View>
            </Pressable>
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
    gap: space.md,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    padding: space.md,
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pressed: {
    opacity: 0.6,
  },
  image: {
    width: 76,
    height: 76,
    borderRadius: radius.md,
    backgroundColor: colors.fill,
  },
  cardText: {
    flex: 1,
    gap: 2,
  },
  cardTitle: {
    ...type.section,
    color: colors.ink,
  },
  cardBody: {
    ...type.small,
    color: colors.muted,
  },
  cardAction: {
    ...type.caption,
    color: colors.saffronDeep,
    marginTop: space.xs,
  },
});
