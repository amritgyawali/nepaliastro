/**
 * Colour tokens.
 *
 * One brand colour — deep saffron, #FF9933 — plus a warm neutral scale. Every
 * other hue is reserved for status (online, busy, error), so a saffron
 * element always means "this is the thing to press".
 */
export const colors = {
  /* Brand ------------------------------------------------------------- */
  /** Deep / Indian saffron — rgb(255, 153, 51). Fills and selected states. */
  saffron: '#FF9933',
  /** Held state for a saffron fill. */
  saffronPressed: '#EC851F',
  /** Saffron dark enough to read as text or an icon on a light surface. */
  saffronDeep: '#A85A11',
  /** Tinted surface: selected chips, soft badges, icon tiles. */
  saffronSoft: '#FFF2E4',
  /** Border that belongs to a saffron-tinted surface. */
  saffronBorder: '#FFD3A6',
  /** Ink used on top of a saffron fill. */
  onSaffron: '#2B1A06',

  /* Surfaces ---------------------------------------------------------- */
  white: '#FFFFFF',
  /** Page background behind cards. */
  canvas: '#F7F5F1',
  /** Quiet fill for inputs and inert chips. */
  fill: '#F2F0EC',

  /* Ink --------------------------------------------------------------- */
  ink: '#1B1A17',
  body: '#3B3934',
  muted: '#6D6963',
  subtle: '#9B968E',

  /* Lines ------------------------------------------------------------- */
  border: '#E5E1DA',
  divider: '#EFEBE4',
  hairline: 'rgba(0,0,0,0.07)',

  /* Status ------------------------------------------------------------ */
  green: '#1F7A46',
  greenSoft: '#E3F2E8',
  red: '#C03F2C',
  redSoft: '#FBECE8',

  /* Utility ----------------------------------------------------------- */
  shadow: '#000000',
  overlay: 'rgba(24,20,15,0.45)',
  transparent: 'transparent',
};

// Deliberately not `as const`: these are the defaults, and the admin
// dashboard's theme is written over them in place (`src/config/apply.ts`), so
// every `colors.x` read at render time gets the published value.

export type ColorToken = keyof typeof colors;
