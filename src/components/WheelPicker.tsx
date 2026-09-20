import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import {
  Animated,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  ScrollView,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';

import { colors, font, radius } from '@/theme';

export const ITEM_HEIGHT = 38;
/** Rows shown at once. Odd so there is a true centre row. */
export const VISIBLE_ITEMS = 7;
const HALF = Math.floor(VISIBLE_ITEMS / 2);
export const WHEEL_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS;

export type WheelOption = { label: string; value: number | string };

type WheelColumnProps = {
  options: WheelOption[];
  value: WheelOption['value'];
  onChange: (value: WheelOption['value']) => void;
  /** Relative width inside the row; mirrors the design's column ratios. */
  flex?: number;
  style?: ViewStyle;
};

/**
 * One scrollable column of an iOS-style picker.
 *
 * Rows snap to `ITEM_HEIGHT`, and each row's size and opacity are driven by
 * its distance from the centre, so the column reads as a curved wheel.
 */
export function WheelColumn({ options, value, onChange, flex = 1, style }: WheelColumnProps) {
  const scrollRef = useRef<ScrollView>(null);
  const scrollY = useRef(new Animated.Value(0)).current;
  const selectedIndex = useMemo(
    () => Math.max(0, options.findIndex((o) => o.value === value)),
    [options, value],
  );
  /** Guards against the programmatic scroll below echoing back as a change. */
  const lastReported = useRef(selectedIndex);

  useEffect(() => {
    lastReported.current = selectedIndex;
    scrollRef.current?.scrollTo({ y: selectedIndex * ITEM_HEIGHT, animated: false });
  }, [selectedIndex]);

  const handleSettle = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const offsetY = event.nativeEvent.contentOffset.y;
      const index = Math.round(offsetY / ITEM_HEIGHT);
      const clamped = Math.min(Math.max(index, 0), options.length - 1);
      if (clamped === lastReported.current) return;
      lastReported.current = clamped;
      onChange(options[clamped].value);
    },
    [onChange, options],
  );

  return (
    <View style={[{ flex }, style]}>
      <Animated.ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_HEIGHT}
        decelerationRate="fast"
        scrollEventThrottle={16}
        nestedScrollEnabled
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
          useNativeDriver: true,
        })}
        onMomentumScrollEnd={handleSettle}
        onScrollEndDrag={handleSettle}
        contentContainerStyle={{ paddingVertical: HALF * ITEM_HEIGHT }}
        style={{ height: WHEEL_HEIGHT }}
      >
        {options.map((option, index) => {
          const inputRange = [
            (index - 3) * ITEM_HEIGHT,
            (index - 2) * ITEM_HEIGHT,
            (index - 1) * ITEM_HEIGHT,
            index * ITEM_HEIGHT,
            (index + 1) * ITEM_HEIGHT,
            (index + 2) * ITEM_HEIGHT,
            (index + 3) * ITEM_HEIGHT,
          ];
          const opacity = scrollY.interpolate({
            inputRange,
            outputRange: [0.18, 0.4, 0.75, 1, 0.75, 0.4, 0.18],
            extrapolate: 'clamp',
          });
          const scale = scrollY.interpolate({
            inputRange,
            outputRange: [0.72, 0.8, 0.9, 1, 0.9, 0.8, 0.72],
            extrapolate: 'clamp',
          });

          return (
            <Animated.View
              key={`${option.value}`}
              style={[styles.item, { opacity, transform: [{ scale }] }]}
            >
              <Animated.Text style={styles.itemText} numberOfLines={1}>
                {option.label}
              </Animated.Text>
            </Animated.View>
          );
        })}
      </Animated.ScrollView>
    </View>
  );
}

/** Lays out several `WheelColumn`s behind one shared selection bar. */
export function WheelPicker({
  children,
  disabled,
}: {
  children: React.ReactNode;
  disabled?: boolean;
}) {
  return (
    <View
      style={[styles.wheel, disabled && styles.wheelDisabled]}
      pointerEvents={disabled ? 'none' : 'auto'}
    >
      <View style={styles.selectionBar} pointerEvents="none" />
      <View style={styles.columns}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  wheel: {
    height: WHEEL_HEIGHT,
    justifyContent: 'center',
  },
  wheelDisabled: {
    opacity: 0.35,
  },
  selectionBar: {
    position: 'absolute',
    left: -8,
    right: -8,
    top: HALF * ITEM_HEIGHT,
    height: ITEM_HEIGHT + 8,
    marginTop: -4,
    borderRadius: radius.md,
    backgroundColor: colors.saffronSoft,
  },
  columns: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  item: {
    height: ITEM_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemText: {
    fontFamily: font.medium,
    fontSize: 24,
    lineHeight: 32,
    color: colors.ink,
    // Web needs an explicit width for the ellipsis to resolve inside a flex row.
    ...Platform.select({ web: { whiteSpace: 'nowrap' as const }, default: {} }),
  },
});
