// The four weights live in `assets/fonts/` rather than coming from an
// @expo-google-fonts package: a file in the project always resolves, on every
// platform and whatever a bundler decides about package subpaths, and it is
// one less dependency to install before the app will start. Mukta is under
// the SIL Open Font License; the licence travels with the files.
import Mukta400 from '../../assets/fonts/Mukta-Regular.ttf';
import Mukta500 from '../../assets/fonts/Mukta-Medium.ttf';
import Mukta600 from '../../assets/fonts/Mukta-SemiBold.ttf';
import Mukta700 from '../../assets/fonts/Mukta-Bold.ttf';
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
