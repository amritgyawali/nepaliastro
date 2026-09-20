// Imported by file rather than from the package root: the root re-exports all
// seven weights, and every one it names would be bundled into the app.
import Mukta400 from '@expo-google-fonts/mukta/400Regular/Mukta_400Regular.ttf';
import Mukta500 from '@expo-google-fonts/mukta/500Medium/Mukta_500Medium.ttf';
import Mukta600 from '@expo-google-fonts/mukta/600SemiBold/Mukta_600SemiBold.ttf';
import Mukta700 from '@expo-google-fonts/mukta/700Bold/Mukta_700Bold.ttf';
import type { TextStyle } from 'react-native';

/**
 * Typography.
 *
 * The app is set in Mukta — a humanist face drawn for Devanagari and Latin
 * together, so a Nepali name, a Sanskrit term and an English label all sit on
 * the same baseline without the page changing voice.
 *
 * React Native does not synthesise weights for a bundled font: each weight is
 * its own family. Styles therefore pick a family from `font` and never set
 * `fontWeight`, which on web would paint a second, fake bold over a face that
 * is already bold.
 */
export const fontAssets = {
  Mukta_400Regular: Mukta400,
  Mukta_500Medium: Mukta500,
  Mukta_600SemiBold: Mukta600,
  Mukta_700Bold: Mukta700,
};

export const font = {
  regular: 'Mukta_400Regular',
  medium: 'Mukta_500Medium',
  semibold: 'Mukta_600SemiBold',
  bold: 'Mukta_700Bold',
} as const;

/** Default face, for the rare style that needs nothing but a family. */
export const fontFamily = font.regular;

/**
 * The whole type scale. Seven steps, each with one job — if a screen needs an
 * eighth, it is usually the layout that wants rethinking.
 */
export const type = {
  /** Screen-opening question or greeting. */
  display: { fontFamily: font.bold, fontSize: 26, lineHeight: 34 },
  /** Nav bar and card titles. */
  title: { fontFamily: font.bold, fontSize: 20, lineHeight: 27 },
  /** Section headings inside a scroll. */
  section: { fontFamily: font.semibold, fontSize: 17, lineHeight: 23 },
  /** Running text. */
  body: { fontFamily: font.regular, fontSize: 16, lineHeight: 24 },
  /** Field labels, list rows, chips. */
  label: { fontFamily: font.medium, fontSize: 15, lineHeight: 21 },
  /** Supporting lines under a title. */
  small: { fontFamily: font.regular, fontSize: 14, lineHeight: 20 },
  /** Timestamps, counters, tab labels. */
  caption: { fontFamily: font.medium, fontSize: 12.5, lineHeight: 17 },
  /** Button labels. */
  button: { fontFamily: font.semibold, fontSize: 17, lineHeight: 23 },
} satisfies Record<string, TextStyle>;
