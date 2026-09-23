import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { t } from '@/config/strings';
import { GUTTER, colors, space, type } from '@/theme';

import { PrimaryButton } from './PrimaryButton';

/**
 * What a screen shows while the dashboard has it switched off: the message
 * the admin wrote, or a plain default, and a way back.
 */
export function ScreenUnavailable({ title, message }: { title: string; message: string }) {
  const router = useRouter();
  return (
    <View style={styles.root}>
      <Text style={styles.title}>{title || t('unavailable.title')}</Text>
      <Text style={styles.body}>{message || t('unavailable.body')}</Text>
      <PrimaryButton
        label={t('unavailable.back')}
        variant="outline"
        onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
        style={styles.button}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: GUTTER,
    gap: space.sm,
  },
  title: { ...type.title, color: colors.ink },
  body: { ...type.body, color: colors.muted },
  button: { marginTop: space.lg },
});
