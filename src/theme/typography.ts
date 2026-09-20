import { Platform, TextStyle } from 'react-native';

/**
 * The designs use the iOS system face (SF Pro). On Android and web we fall
 * back to the closest platform default so metrics stay comparable.
 */
export const fontFamily = Platform.select({
  ios: undefined, // System / SF Pro
  android: 'sans-serif',
  default:
    '-apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display", "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
});

export const weight = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  heavy: '800',
} satisfies Record<string, TextStyle['fontWeight']>;

export const text = {
  /** Large onboarding question, e.g. "What is your gender?" */
  question: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: weight.bold,
    letterSpacing: -0.4,
  },
  /** Centred nav title, e.g. "Enter your details" */
  navTitle: {
    fontSize: 20,
    lineHeight: 24,
    fontWeight: weight.bold,
    letterSpacing: -0.3,
  },
  sectionTitle: {
    fontSize: 18,
    lineHeight: 22,
    fontWeight: weight.bold,
    letterSpacing: -0.3,
  },
  body: { fontSize: 15, lineHeight: 21, fontWeight: weight.regular },
  small: { fontSize: 13, lineHeight: 18, fontWeight: weight.regular },
  tiny: { fontSize: 11, lineHeight: 14, fontWeight: weight.medium },
  cta: { fontSize: 17, lineHeight: 22, fontWeight: weight.semibold },
} satisfies Record<string, TextStyle>;
