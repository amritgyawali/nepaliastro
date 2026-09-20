import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ChevronLeft } from '@/icons';
import { GUTTER, TOUCH_SIZE, colors, type } from '@/theme';

type NavHeaderProps = {
  title: string;
  /** Renders on the right-hand side, e.g. the "End" action in the chat. */
  right?: React.ReactNode;
  /** Adds the rule that separates the bar from a scrolling page. */
  bordered?: boolean;
  onBack?: () => void;
};

/**
 * Back arrow, title, optional action. The title is left-aligned next to the
 * arrow rather than floating in the middle: it reads as a heading, and it
 * leaves the whole right-hand side free for the action.
 */
export function NavHeader({ title, right, bordered = false, onBack }: NavHeaderProps) {
  const router = useRouter();

  const handleBack = () => {
    if (onBack) return onBack();
    if (router.canGoBack()) router.back();
    else router.replace('/');
  };

  return (
    <View style={[styles.root, bordered && styles.bordered]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Go back"
        onPress={handleBack}
        hitSlop={8}
        style={({ pressed }) => [styles.back, pressed && styles.pressed]}
      >
        <ChevronLeft size={24} color={colors.ink} strokeWidth={2} />
      </Pressable>

      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>

      <View style={styles.right}>{right}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    height: 56,
    paddingHorizontal: GUTTER - 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.white,
  },
  bordered: {
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  back: {
    width: TOUCH_SIZE,
    height: TOUCH_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.5,
  },
  title: {
    ...type.title,
    color: colors.ink,
    flex: 1,
  },
  right: {
    minHeight: TOUCH_SIZE,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
});
