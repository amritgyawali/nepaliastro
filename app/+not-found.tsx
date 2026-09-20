import { Link, Stack } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors, fontFamily, weight } from '@/theme';

export default function NotFound() {
  return (
    <>
      <Stack.Screen options={{ title: 'Not found' }} />
      <View style={styles.root}>
        <Text style={styles.title}>This page could not be found.</Text>
        <Link href="/" style={styles.link}>
          Go to home
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: colors.cream,
    gap: 12,
  },
  title: {
    fontFamily,
    fontSize: 17,
    fontWeight: weight.semibold,
    color: colors.ink,
  },
  link: {
    fontFamily,
    fontSize: 15,
    fontWeight: weight.medium,
    color: colors.blueCta,
  },
});
