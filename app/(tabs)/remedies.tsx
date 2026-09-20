import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Screen } from '@/components';
import { remedyHeroFeatures, remedyServices, remedyStats } from '@/data/content';
import { Grounding, Hamburger, History, MalaArt, Meditate, Search, Shield } from '@/icons';
import { TAB_BAR_HEIGHT, colors, fontFamily, radius, shadow, weight } from '@/theme';

const FEATURE_ICONS = {
  shield: Shield,
  meditate: Meditate,
  grounding: Grounding,
} as const;

/** AstroRemedy tab — design/astroremedy_remedies_essentials. */
export default function RemediesScreen() {
  const insets = useSafeAreaInsets();
  const bottomInset = TAB_BAR_HEIGHT + Math.max(insets.bottom, 10);

  return (
    <Screen background={colors.white}>
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Open menu"
          style={({ pressed }) => [styles.circleButton, pressed && styles.pressed]}
        >
          <Hamburger size={21} color="#2B2F33" />
        </Pressable>

        <Text style={styles.brand}>AstroRemedy</Text>

        <View style={styles.headerActions}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="History"
            style={({ pressed }) => [styles.circleButton, pressed && styles.pressed]}
          >
            <History size={21} color="#2B2F33" />
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Search"
            style={({ pressed }) => [styles.circleButton, pressed && styles.pressed]}
          >
            <Search size={21} color="#2B2F33" />
          </Pressable>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content, { paddingBottom: bottomInset + 24 }]}
        style={styles.scroll}
      >
        {/* Rudraksha hero */}
        <View style={styles.hero}>
          <View style={styles.heroCopy}>
            <Text style={styles.heroTitle}>RUDRAKSHA &amp;{'\n'}KARUNGALI ESSENTIALS</Text>
            <Text style={styles.heroSubtitle}>
              Strong protection, calm mind &amp; balanced energy
            </Text>

            <View style={styles.heroFeatures}>
              {remedyHeroFeatures.map((feature) => {
                const Icon = FEATURE_ICONS[feature.icon];
                return (
                  <View key={feature.id} style={styles.heroFeature}>
                    <View style={styles.heroFeatureIcon}>
                      <Icon size={15} color="#594835" />
                    </View>
                    <Text style={styles.heroFeatureLabel} numberOfLines={2}>
                      {feature.label}
                    </Text>
                  </View>
                );
              })}
            </View>

            <Pressable
              accessibilityRole="button"
              style={({ pressed }) => [styles.shopButton, pressed && styles.pressed]}
            >
              <Text style={styles.shopLabel}>SHOP NOW</Text>
            </Pressable>
          </View>

          <View style={styles.heroArt} pointerEvents="none">
            <MalaArt width={186} height={166} />
          </View>

          <View style={styles.dots}>
            <View style={[styles.dot, styles.dotActive]} />
            <View style={styles.dot} />
            <View style={styles.dot} />
            <View style={styles.dot} />
          </View>
        </View>

        {/* Counters */}
        <View style={styles.stats}>
          {remedyStats.map((stat, index) => (
            <React.Fragment key={stat.label}>
              {index > 0 ? <View style={styles.statDivider} /> : null}
              <View style={styles.stat}>
                <Text style={styles.statValue}>
                  {stat.value}
                  {stat.star ? <Text style={styles.statStar}> ★</Text> : null}
                </Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            </React.Fragment>
          ))}
        </View>

        {/* Service grid */}
        <View style={styles.grid}>
          {remedyServices.map((service) => (
            <Pressable
              key={service.id}
              accessibilityRole="button"
              accessibilityLabel={service.title.replace('\n', ' ')}
              style={({ pressed }) => [
                styles.serviceCard,
                { backgroundColor: service.tint },
                pressed && styles.servicePressed,
              ]}
            >
              <Image source={{ uri: service.image }} style={styles.serviceImage} resizeMode="cover" />
              <LinearGradient
                colors={['rgba(0,0,0,0.18)', 'rgba(0,0,0,0.06)', 'rgba(0,0,0,0.72)']}
                locations={[0, 0.4, 1]}
                style={StyleSheet.absoluteFill}
              />
              {service.trending ? (
                <LinearGradient
                  colors={[colors.trendingFrom, colors.trendingTo]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.trending}
                >
                  <Text style={styles.trendingLabel}>TRENDING</Text>
                </LinearGradient>
              ) : null}
              <View style={styles.serviceCaption}>
                <Text style={styles.serviceTitle}>{service.title}</Text>
              </View>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 6,
    paddingBottom: 12,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.hairline,
  },
  circleButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E6E6E9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.75,
    transform: [{ scale: 0.96 }],
  },
  brand: {
    fontFamily,
    fontSize: 24,
    fontWeight: weight.bold,
    letterSpacing: -0.6,
    color: '#0C0D0E',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  scroll: {
    flex: 1,
    backgroundColor: colors.creamWarm,
  },
  content: {
    paddingHorizontal: 14,
    paddingTop: 12,
    gap: 14,
  },

  hero: {
    minHeight: 178,
    borderRadius: radius.xxl,
    backgroundColor: colors.remedyHero,
    borderWidth: 1,
    borderColor: colors.remedyHeroBorder,
    padding: 16,
    overflow: 'hidden',
    ...shadow(1, 0.04),
  },
  heroCopy: {
    maxWidth: '64%',
    zIndex: 2,
  },
  heroTitle: {
    fontFamily,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: weight.bold,
    letterSpacing: 0.8,
    color: colors.remedyHeroTitle,
  },
  heroSubtitle: {
    fontFamily,
    fontSize: 10.5,
    lineHeight: 14,
    fontWeight: weight.medium,
    color: colors.remedyHeroBody,
    marginTop: 5,
  },
  heroFeatures: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  heroFeature: {
    alignItems: 'center',
    width: 56,
  },
  heroFeatureIcon: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: '#8F7C66',
    backgroundColor: 'rgba(247,242,232,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroFeatureLabel: {
    fontFamily,
    fontSize: 7.5,
    lineHeight: 10,
    fontWeight: weight.medium,
    textAlign: 'center',
    color: '#5F4E3D',
    marginTop: 3,
  },
  shopButton: {
    alignSelf: 'flex-start',
    marginTop: 14,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: radius.pill,
    backgroundColor: '#4E4740',
  },
  shopLabel: {
    fontFamily,
    fontSize: 9.5,
    fontWeight: weight.bold,
    letterSpacing: 1,
    color: colors.white,
  },
  heroArt: {
    position: 'absolute',
    right: -6,
    top: 6,
    justifyContent: 'center',
  },
  dots: {
    position: 'absolute',
    bottom: 8,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.45)',
  },
  dotActive: {
    width: 20,
    backgroundColor: colors.white,
  },

  stats: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.remedyStat,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.remedyStatBorder,
    paddingVertical: 14,
    ...shadow(1, 0.03),
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: '#E7DCBF',
  },
  statValue: {
    fontFamily,
    fontSize: 17,
    fontWeight: weight.heavy,
    letterSpacing: -0.4,
    color: colors.remedyStatValue,
  },
  statStar: {
    fontSize: 14,
    color: '#A26D1E',
  },
  statLabel: {
    fontFamily,
    fontSize: 9.5,
    fontWeight: weight.bold,
    letterSpacing: 0.8,
    color: colors.remedyStatLabel,
    marginTop: 3,
  },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  serviceCard: {
    width: '48%',
    aspectRatio: 4 / 5,
    borderRadius: radius.xl,
    overflow: 'hidden',
    ...shadow(3, 0.12, 10),
  },
  servicePressed: {
    transform: [{ scale: 0.985 }],
  },
  serviceImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  trending: {
    position: 'absolute',
    top: 0,
    left: 0,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderBottomRightRadius: 14,
  },
  trendingLabel: {
    fontFamily,
    fontSize: 9.5,
    fontWeight: weight.heavy,
    letterSpacing: 0.9,
    color: colors.white,
  },
  serviceCaption: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: 12,
  },
  serviceTitle: {
    fontFamily,
    fontSize: 18,
    lineHeight: 22,
    fontWeight: weight.bold,
    textAlign: 'center',
    color: colors.white,
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
});
