import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { promoSlides, type PromoSlide } from '@/data/content';
import { colors, fontFamily, radius, shadow, weight } from '@/theme';

import { useReduceMotion } from '@/hooks/useReduceMotion';
import { Skeleton } from '../Skeleton';

/** How long a slide rests before the carousel moves on. */
const AUTOPLAY_MS = 5200;
/** How long autoplay stays out of the way after the reader takes over. */
const RESUME_MS = 9000;

type PromoCarouselProps = {
  onSelect?: (slide: PromoSlide) => void;
};

/**
 * The promo cards, as a paged carousel.
 *
 * Autoplay is a convenience, not the only way through: it stops the moment a
 * finger lands on the strip, stays off for a few seconds afterwards, and
 * never runs at all under "Reduce Motion". The dots are indicators rather
 * than controls, so they stay out of the focus order.
 */
export function PromoCarousel({ onSelect }: PromoCarouselProps) {
  const reduceMotion = useReduceMotion();
  const scrollRef = useRef<ScrollView>(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  const resumeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [width, setWidth] = useState(0);
  const [index, setIndex] = useState(0);
  const [interacting, setInteracting] = useState(false);
  // The autoplay timer needs the current page without being re-created every
  // time the page changes, so it reads a ref rather than the state.
  const indexRef = useRef(0);

  const settleOn = (next: number) => {
    indexRef.current = next;
    setIndex(next);
  };

  // Autoplay. Paused while the reader is driving, and off entirely when the
  // OS asks for reduced motion.
  useEffect(() => {
    if (reduceMotion || interacting || width <= 0) return;

    const timer = setInterval(() => {
      const next = (indexRef.current + 1) % promoSlides.length;
      settleOn(next);
      scrollRef.current?.scrollTo({ x: next * width, y: 0, animated: true });
    }, AUTOPLAY_MS);

    return () => clearInterval(timer);
  }, [interacting, reduceMotion, width]);

  useEffect(
    () => () => {
      if (resumeTimer.current) clearTimeout(resumeTimer.current);
    },
    [],
  );

  const handleTouchStart = () => {
    if (resumeTimer.current) clearTimeout(resumeTimer.current);
    setInteracting(true);
  };

  const handleSettled = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (width > 0) {
      settleOn(Math.round(event.nativeEvent.contentOffset.x / width));
    }
    if (resumeTimer.current) clearTimeout(resumeTimer.current);
    resumeTimer.current = setTimeout(() => setInteracting(false), RESUME_MS);
  };

  return (
    <View style={styles.wrapper} onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
      <Animated.ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        onScrollBeginDrag={handleTouchStart}
        onMomentumScrollEnd={handleSettled}
        onScrollEndDrag={handleSettled}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          // Drives three dot widths, which are layout rather than transform,
          // so this one stays on the JS driver.
          { useNativeDriver: false },
        )}
      >
        {promoSlides.map((slide) => (
          <View key={slide.id} style={width > 0 ? { width } : styles.measuring}>
            <PromoSlideCard slide={slide} onPress={() => onSelect?.(slide)} />
          </View>
        ))}
      </Animated.ScrollView>

      <View
        style={styles.dots}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
      >
        {promoSlides.map((slide, i) => {
          const active = i === index;
          const animated = width > 0;
          const range = [(i - 1) * width, i * width, (i + 1) * width];

          return (
            <Animated.View
              key={slide.id}
              style={[
                styles.dot,
                animated
                  ? {
                      width: scrollX.interpolate({
                        inputRange: range,
                        outputRange: [7, 20, 7],
                        extrapolate: 'clamp',
                      }),
                      opacity: scrollX.interpolate({
                        inputRange: range,
                        outputRange: [0.32, 1, 0.32],
                        extrapolate: 'clamp',
                      }),
                    }
                  : { width: active ? 20 : 7, opacity: active ? 1 : 0.32 },
              ]}
            />
          );
        })}
      </View>
    </View>
  );
}

/**
 * One slide: the astrologer on a yellow quarter-disc that bleeds off the left
 * edge, reproduced with an oversized circle clipped by the card.
 */
function PromoSlideCard({ slide, onPress }: { slide: PromoSlide; onPress: () => void }) {
  const [loaded, setLoaded] = useState(false);

  return (
    <View style={styles.card}>
      <View style={styles.left}>
        <View style={styles.arc} pointerEvents="none" />
        <View style={styles.portraitClip}>
          <Image
            source={{ uri: slide.image }}
            style={styles.portrait}
            resizeMode="cover"
            onLoad={() => setLoaded(true)}
            onError={() => setLoaded(true)}
            accessibilityLabel="Astrologer"
          />
          {loaded ? null : (
            <View style={styles.portraitPlaceholder} pointerEvents="none">
              <Skeleton width="100%" height={120} radius={0} />
            </View>
          )}
        </View>
      </View>

      <View style={styles.right}>
        <Text style={styles.headline}>
          {slide.question} <Text style={styles.headlineStrong}>{slide.emphasis}</Text>
        </Text>
        <Text style={styles.subtitle}>{slide.kicker}</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${slide.cta}. ${slide.question} ${slide.emphasis}`}
          onPress={onPress}
          style={({ pressed }) => [styles.cta, pressed && styles.ctaPressed]}
        >
          <Text style={styles.ctaLabel}>{slide.cta}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginTop: 14,
  },
  /** Before the first layout pass there is no page width to hand the slides. */
  measuring: {
    width: '100%',
  },
  card: {
    marginHorizontal: 14,
    minHeight: 148,
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: '#EFEFEF',
    overflow: 'hidden',
    ...shadow(3, 0.07, 14),
  },
  left: {
    width: '42%',
    justifyContent: 'flex-end',
    alignItems: 'center',
    overflow: 'hidden',
    backgroundColor: '#F2DE4E',
  },
  arc: {
    position: 'absolute',
    left: -28,
    top: -26,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: '#F7E877',
  },
  portraitClip: {
    width: '84%',
    height: '86%',
    alignSelf: 'center',
    marginTop: 'auto',
    borderTopLeftRadius: 60,
    borderTopRightRadius: 60,
    overflow: 'hidden',
  },
  portrait: {
    width: '100%',
    height: '100%',
  },
  portraitPlaceholder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'flex-end',
  },
  right: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 16,
    justifyContent: 'center',
  },
  headline: {
    fontFamily,
    fontSize: 16,
    lineHeight: 21,
    fontWeight: weight.medium,
    color: '#1B1D20',
    letterSpacing: -0.2,
  },
  headlineStrong: {
    fontWeight: weight.bold,
  },
  subtitle: {
    fontFamily,
    fontSize: 13,
    color: '#5C6066',
    marginTop: 6,
  },
  cta: {
    alignSelf: 'flex-start',
    marginTop: 10,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: radius.pill,
    backgroundColor: '#F2DE4E',
  },
  ctaPressed: {
    backgroundColor: colors.yellowPressed,
    transform: [{ scale: 0.97 }],
  },
  ctaLabel: {
    fontFamily,
    fontSize: 13,
    fontWeight: weight.semibold,
    color: '#26262A',
  },
  dots: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 10,
  },
  dot: {
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.ink,
  },
});
