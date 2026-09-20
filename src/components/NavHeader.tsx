import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ChevronLeft } from '@/icons';
import { colors, fontFamily, weight } from '@/theme';

type NavHeaderProps = {
  title: string;
  /** Renders on the right-hand side, e.g. the "End" action in the chat. */
  right?: React.ReactNode;
  /** Adds the hairline rule seen on the onboarding screens. */
  bordered?: boolean;
  onBack?: () => void;
};

/**
 * The circular back button + centred title used by onboarding, the chat and
 * Profile & Settings. The title is absolutely positioned so it stays optically
 * centred regardless of what sits on either side.
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
        style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
      >
        <ChevronLeft size={21} color={colors.backBtnIcon} />
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
    height: 64,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.white,
  },
  bordered: {
    borderBottomWidth: 1,
    borderBottomColor: colors.hairline,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.backBtn,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.7,
    transform: [{ scale: 0.96 }],
  },
  title: {
    position: 'absolute',
    left: 0,
    right: 0,
    textAlign: 'center',
    fontFamily,
    fontSize: 20,
    fontWeight: weight.bold,
    letterSpacing: -0.3,
    color: colors.inkStrong,
  },
  right: {
    minWidth: 44,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
});
