/**
 * Colour tokens transcribed from the Stitch design files in `design/`.
 * Values were cross-checked against the original iPhone screenshots
 * (design/img_31xx.png) so the app matches the reference pixel for pixel.
 */
export const colors = {
  // Surfaces
  cream: '#FBF9EE', // onboarding + directory background
  creamAlt: '#FAF8EE',
  creamWarm: '#FAF9F6', // chat scroll area / remedies background
  white: '#FFFFFF',
  appGrey: '#F4F4F3', // profile & settings background
  sheet: '#F8F8F7',

  // Brand yellows
  yellow: '#EFDA43', // primary CTA fill
  yellowPressed: '#E4CE33',
  yellowDot: '#F0DC4A', // stepper dots
  yellowCategory: '#EBDC45', // home quick-category circles
  yellowSoft: '#FDF6C9',
  yellowAvatarRing: '#EBD25B',

  // Banner
  bannerTop: '#FFFBEA',
  bannerBottom: '#FBF6DC',
  bannerBorder: '#EFDF9B',
  coin: '#E3C25F',
  coinDeep: '#C79A32',

  // Ink / text
  ink: '#1C1F22',
  inkStrong: '#111315',
  heading: '#4B5563', // large onboarding questions
  body: '#2E312E',
  muted: '#7B7F86',
  subtle: '#A5A6A8',
  faint: '#C4C2BA',

  // Controls
  backBtn: '#E7E7E4',
  backBtnIcon: '#2C2C2E',
  circleBtn: '#E5E5EA',
  inputBorder: '#C7C9CC',
  chipBorder: '#D6D8DC',
  chipIdle: '#FFFFFF',
  cardBorder: '#EFEFEC',
  divider: '#F0F0EE',
  hairline: 'rgba(0,0,0,0.07)',

  // Bottom navigation (floating pill)
  navBg: '#D9D8D4',
  navActive: '#C7C6C2',
  navIcon: '#3D3A35',
  navIconActive: '#111111',

  // Status / semantic
  green: '#34C759',
  greenText: '#1B873F',
  greenSoft: '#DDF4E4',
  greenSoftText: '#2B8349',
  red: '#DC2626',
  redBattery: '#E5483D',
  blue: '#1E40AF',
  blueCta: '#0026FE',
  chatBubbleOut: '#FFEBB7',

  // Session pill
  sessionBg: '#FAF7DA',
  sessionBorder: '#F1E7B0',

  // Remedies
  remedyHero: '#ECE3D2',
  remedyHeroBorder: '#E2D5BE',
  remedyStat: '#FDF8E8',
  remedyStatBorder: '#EFE5CD',
  remedyStatValue: '#524438',
  remedyStatLabel: '#8A7969',
  remedyHeroTitle: '#4B3B2B',
  remedyHeroBody: '#715F4C',
  trendingFrom: '#BA3C3C',
  trendingTo: '#C9533B',

  shadow: '#000000',
  overlay: 'rgba(0,0,0,0.5)',
  transparent: 'transparent',
} as const;

export type ColorToken = keyof typeof colors;
