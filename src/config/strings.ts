/**
 * Words on the screens that the dashboard can rewrite.
 *
 * Each key here is read somewhere in the app with `t('key')`. The value is
 * what ships; the dashboard's Text editor lists every key and stores only the
 * ones someone changed, so an update to a default here still reaches anyone
 * who never touched that line.
 */
export const STRING_DEFAULTS = {
  'services.title': 'Services',
  'services.subtitle': 'Twenty readings, computed on your phone',
  'services.search': 'Search — rashifal, sait, china, milan…',
  'services.footnote':
    'Every reading here is computed on this phone from the positions of the grahas, not fetched from a server — so they work with no signal.',

  'chat.title': 'Chat',
  'chat.subtitle': 'Message an astrologer, minute by minute',
  'call.title': 'Call',
  'call.subtitle': 'Speak to an astrologer, minute by minute',

  'remedies.title': 'Remedies',
  'remedies.subtitle': 'Poojas, gemstones and healing sessions',
  'remedies.cue': 'See what it includes',

  'profile.title': 'Profile',
  'profile.logout': 'Log out',
  'profile.logoutNote':
    'Logging out clears the saved details on this device, so the next person starts from the first question.',
  'profile.support': 'Help and support',

  'offer.title': 'Your first minute is free',
  'offer.body':
    'Your birth details are saved. Start with the highest-rated astrologer near you — you are not charged until the minute is up.',
  'offer.cta': 'Start free chat',
  'offer.skip': 'Maybe later',

  'unavailable.title': 'This screen is switched off',
  'unavailable.body': 'It will be back soon. Everything else in the app still works.',
  'unavailable.back': 'Go back',

  'page.missing': 'This page is not available.',
} as const;

export type StringKey = keyof typeof STRING_DEFAULTS;

/** Where each key appears, for the editor's grouping. */
export const STRING_GROUPS: { title: string; prefix: string }[] = [
  { title: 'Services tab', prefix: 'services.' },
  { title: 'Chat and call tabs', prefix: 'chat.' },
  { title: 'Chat and call tabs', prefix: 'call.' },
  { title: 'Remedies tab', prefix: 'remedies.' },
  { title: 'Profile', prefix: 'profile.' },
  { title: 'Free-minute offer', prefix: 'offer.' },
  { title: 'Switched-off screens', prefix: 'unavailable.' },
  { title: 'Custom pages', prefix: 'page.' },
];

/** The published overrides. Written in place by `apply.ts`. */
const overrides: Record<string, string> = {};

export function setStringOverrides(next: Record<string, string>): void {
  for (const key of Object.keys(overrides)) delete overrides[key];
  for (const [key, value] of Object.entries(next)) {
    if (typeof value === 'string' && value.trim()) overrides[key] = value;
  }
}

/** The text for a key: the published override, or what ships. */
export function t(key: StringKey): string {
  return overrides[key] ?? STRING_DEFAULTS[key];
}
