import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ChatDots, Phone } from '@/icons';
import { SCREEN_MAX_WIDTH, colors, fontFamily, radius, shadow, weight } from '@/theme';

type ConsultCTAsProps = {
  onChat?: () => void;
  onCall?: () => void;
  /** Distance from the bottom of the screen, i.e. clear of the tab bar. */
  bottom: number;
};

/** The blue/yellow pair of consultation buttons floating above the tab bar. */
export function ConsultCTAs({ onChat, onCall, bottom }: ConsultCTAsProps) {
  return (
    <View style={[styles.wrapper, { bottom }]} pointerEvents="box-none">
      <View style={styles.row}>
        <Pressable
          accessibilityRole="button"
          onPress={onChat}
          style={({ pressed }) => [styles.button, styles.chat, pressed && styles.pressed]}
        >
          <ChatDots size={18} color={colors.white} filled />
          <Text style={[styles.label, styles.chatLabel]}>Chat with Astrologer</Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          onPress={onCall}
          style={({ pressed }) => [styles.button, styles.call, pressed && styles.pressed]}
        >
          <Phone size={17} color="#111111" filled />
          <Text style={[styles.label, styles.callLabel]}>Call with Astrologer</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: 14,
  },
  row: {
    width: '100%',
    maxWidth: SCREEN_MAX_WIDTH - 28,
    flexDirection: 'row',
    gap: 10,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: radius.pill,
    ...shadow(5, 0.18, 14),
  },
  pressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.92,
  },
  chat: {
    backgroundColor: colors.blueCta,
  },
  call: {
    backgroundColor: '#F2DE4E',
  },
  label: {
    fontFamily,
    fontSize: 13,
    fontWeight: weight.bold,
    letterSpacing: -0.2,
  },
  chatLabel: {
    color: colors.white,
  },
  callLabel: {
    color: '#111111',
  },
});
