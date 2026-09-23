import { Platform, type TextStyle } from 'react-native';

import { font } from '@/theme/typography';

/**
 * The dashboard's own look.
 *
 * It is fixed, and deliberately separate from the app's theme: someone
 * trying out a dark palette or a tiny type scale for the app still needs a
 * dashboard they can read. The sidebar is the deep red-brown of a temple
 * door, the one thing that marks this as the back room of a Nepali app;
 * everything on the page itself stays quiet — white panels on a stone-grey
 * ground, with saffron kept for the thing to press.
 */
export const A = {
  /* The sidebar */
  mandir: '#2A1215',
  mandirRaised: '#3B1D21',
  mandirActive: '#4A2429',
  mandirLine: 'rgba(255,236,224,0.09)',
  mandirText: '#F5E9E1',
  mandirMuted: '#BFA39B',
  brass: '#D6AE3F',

  /* The page */
  canvas: '#F4F3F0',
  surface: '#FFFFFF',
  sunken: '#EFEDE9',
  hover: '#F7F6F3',

  ink: '#1D1A17',
  body: '#3F3A35',
  muted: '#6E6862',
  subtle: '#9A938A',
  line: '#E5E1DA',
  lineStrong: '#D2CBC1',

  saffron: '#EE8A1F',
  saffronPressed: '#D97813',
  saffronSoft: '#FDEEDC',
  saffronInk: '#94500B',
  onSaffron: '#231303',

  green: '#1E7A45',
  greenSoft: '#E3F2E8',
  red: '#BF3A2B',
  redSoft: '#FBEAE6',
  blue: '#1D63C4',
  blueSoft: '#E5EEFB',
  amber: '#A86A0C',
  amberSoft: '#FCF1DA',

  overlay: 'rgba(20,10,11,0.5)',
  white: '#FFFFFF',
} as const;

export type AdminTone = 'neutral' | 'brand' | 'success' | 'danger' | 'info' | 'warning';

export const TONES: Record<AdminTone, { fg: string; bg: string }> = {
  neutral: { fg: A.body, bg: A.sunken },
  brand: { fg: A.saffronInk, bg: A.saffronSoft },
  success: { fg: A.green, bg: A.greenSoft },
  danger: { fg: A.red, bg: A.redSoft },
  info: { fg: A.blue, bg: A.blueSoft },
  warning: { fg: A.amber, bg: A.amberSoft },
};

export const S = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 } as const;

export const R = { sm: 6, md: 10, lg: 14, pill: 999 } as const;

const mono = Platform.select({ ios: 'Menlo', android: 'monospace', default: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace' });

/** The dashboard's type scale — tighter than the app's, for denser screens. */
export const T = {
  display: { fontFamily: font.bold, fontSize: 26, lineHeight: 31, letterSpacing: -0.3 },
  h1: { fontFamily: font.bold, fontSize: 22, lineHeight: 28, letterSpacing: -0.2 },
  h2: { fontFamily: font.semibold, fontSize: 17, lineHeight: 23 },
  h3: { fontFamily: font.semibold, fontSize: 15, lineHeight: 20 },
  body: { fontFamily: font.regular, fontSize: 14.5, lineHeight: 21 },
  label: { fontFamily: font.medium, fontSize: 13.5, lineHeight: 18 },
  small: { fontFamily: font.regular, fontSize: 13, lineHeight: 18 },
  eyebrow: { fontFamily: font.semibold, fontSize: 11.5, lineHeight: 15, letterSpacing: 0.7, textTransform: 'uppercase' },
  mono: { fontFamily: mono, fontSize: 12.5, lineHeight: 18 },
  button: { fontFamily: font.semibold, fontSize: 14, lineHeight: 18 },
} satisfies Record<string, TextStyle>;

/** Widths at which the shell changes shape. */
export const BREAKPOINTS = {
  /** Below: phone — top bar, drawer and bottom dock. */
  tablet: 720,
  /** Below: a narrow icon rail. At or above: the full sidebar. */
  desktop: 1100,
} as const;

export const SIDEBAR_WIDTH = 256;
export const RAIL_WIDTH = 72;
export const CONTENT_MAX = 1180;

/** A soft shadow for anything that floats: menus, dialogs, toasts. */
export const lift =
  Platform.OS === 'web'
    ? ({ boxShadow: '0 10px 30px rgba(30,15,10,0.16), 0 2px 6px rgba(30,15,10,0.08)' } as object)
    : Platform.OS === 'android'
      ? { elevation: 8 }
      : { shadowColor: '#1E0F0A', shadowOpacity: 0.16, shadowRadius: 18, shadowOffset: { width: 0, height: 8 } };
