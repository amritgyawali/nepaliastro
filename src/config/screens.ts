import type { ScreenRule } from './schema';

/**
 * Every screen in the app, as the dashboard's screen manager lists them.
 *
 * `key` is the route pattern the rule is stored under, and `match` finds it
 * from a live pathname (`/chat/ai-baba` → `/chat/[id]`). A screen marked
 * `essential` is one the app cannot work without — home, profile, the
 * onboarding questions — and cannot be switched off.
 */
export type ScreenEntry = {
  key: string;
  label: string;
  group: 'Tabs' | 'Every day' | 'Your chart' | 'Choosing a time' | 'Remedies' | 'Consult' | 'Account' | 'Onboarding';
  /** A path the dashboard can open to show it. */
  sample: string;
  essential?: boolean;
};

export const APP_SCREENS: ScreenEntry[] = [
  { key: '/', label: 'Home', group: 'Tabs', sample: '/', essential: true },
  { key: '/services', label: 'Services', group: 'Tabs', sample: '/services' },
  { key: '/chat', label: 'Chat directory', group: 'Tabs', sample: '/chat' },
  { key: '/call', label: 'Call directory', group: 'Tabs', sample: '/call' },
  { key: '/remedies', label: 'Remedies', group: 'Tabs', sample: '/remedies' },

  { key: '/horoscope', label: 'Rashifal', group: 'Every day', sample: '/horoscope' },
  { key: '/panchang', label: 'Panchang', group: 'Every day', sample: '/panchang' },
  { key: '/patro', label: 'Nepali Patro', group: 'Every day', sample: '/patro' },
  { key: '/date-converter', label: 'Date converter', group: 'Every day', sample: '/date-converter' },
  { key: '/lucky', label: 'Lucky colour and number', group: 'Every day', sample: '/lucky' },
  { key: '/festivals', label: 'Festivals', group: 'Every day', sample: '/festivals' },

  { key: '/kundli', label: 'Janma Kundali', group: 'Your chart', sample: '/kundli' },
  { key: '/dasha', label: 'Graha Dasha', group: 'Your chart', sample: '/dasha' },
  { key: '/dosha', label: 'Dosha check', group: 'Your chart', sample: '/dosha' },
  { key: '/matching', label: 'Kundali Milan', group: 'Your chart', sample: '/matching' },
  { key: '/transit', label: 'Gochar transits', group: 'Your chart', sample: '/transit' },
  { key: '/varshaphal', label: 'Varshaphal', group: 'Your chart', sample: '/varshaphal' },
  { key: '/numerology', label: 'Ank Jyotish', group: 'Your chart', sample: '/numerology' },

  { key: '/muhurta', label: 'Shubha Sait', group: 'Choosing a time', sample: '/muhurta' },
  { key: '/lagna', label: 'Shubha Lagna', group: 'Choosing a time', sample: '/lagna' },
  { key: '/prashna', label: 'Prashna', group: 'Choosing a time', sample: '/prashna' },

  { key: '/gemstone', label: 'Ratna and Rudraksha', group: 'Remedies', sample: '/gemstone' },
  { key: '/naming', label: 'Namkaran', group: 'Remedies', sample: '/naming' },
  { key: '/vastu', label: 'Vastu', group: 'Remedies', sample: '/vastu' },
  { key: '/remedy/[id]', label: 'Remedy detail', group: 'Remedies', sample: '/remedy/pooja' },

  { key: '/astrologer/[id]', label: 'Astrologer profile', group: 'Consult', sample: '/astrologer/vihana' },
  { key: '/chat/[id]', label: 'Live chat', group: 'Consult', sample: '/chat/ai-baba' },
  { key: '/call/[id]', label: 'Live call', group: 'Consult', sample: '/call/kailash' },

  { key: '/predictions', label: 'Your predictions', group: 'Account', sample: '/predictions' },
  { key: '/prediction/[id]', label: 'One prediction', group: 'Account', sample: '/predictions' },
  { key: '/notifications', label: 'Prediction alerts', group: 'Account', sample: '/notifications' },
  { key: '/profile', label: 'Profile', group: 'Account', sample: '/profile', essential: true },
  { key: '/page/[slug]', label: 'Custom pages', group: 'Account', sample: '/page/about' },

  { key: '/onboarding/name', label: 'Name', group: 'Onboarding', sample: '/onboarding/name', essential: true },
  { key: '/onboarding/gender', label: 'Gender', group: 'Onboarding', sample: '/onboarding/gender', essential: true },
  { key: '/onboarding/birth-date', label: 'Birth date', group: 'Onboarding', sample: '/onboarding/birth-date', essential: true },
  { key: '/onboarding/birth-time', label: 'Birth time', group: 'Onboarding', sample: '/onboarding/birth-time', essential: true },
  { key: '/onboarding/birth-place', label: 'Birth place', group: 'Onboarding', sample: '/onboarding/birth-place', essential: true },
  { key: '/onboarding/languages', label: 'Languages', group: 'Onboarding', sample: '/onboarding/languages', essential: true },
];

const DYNAMIC = APP_SCREENS.filter((screen) => screen.key.includes('['));

/** The route pattern for a live pathname, e.g. `/chat/ai-baba` → `/chat/[id]`. */
export function routeKeyOf(pathname: string): string {
  const clean = pathname.replace(/\/\([^/]+\)/g, '').replace(/\/+$/, '') || '/';
  if (APP_SCREENS.some((screen) => screen.key === clean)) return clean;
  for (const screen of DYNAMIC) {
    const prefix = screen.key.slice(0, screen.key.indexOf('['));
    const rest = clean.slice(prefix.length);
    if (clean.startsWith(prefix) && rest && !rest.includes('/')) return screen.key;
  }
  return clean;
}

/** The published rules. Written in place by `apply.ts`. */
const rules: Record<string, ScreenRule> = {};

export function setScreenRules(next: Record<string, ScreenRule>): void {
  for (const key of Object.keys(rules)) delete rules[key];
  Object.assign(rules, next);
}

/** The rule for a pathname, if the dashboard has set one. */
export function screenRuleFor(pathname: string): ScreenRule | undefined {
  const key = routeKeyOf(pathname);
  const rule = rules[key];
  if (!rule) return undefined;
  const essential = APP_SCREENS.find((screen) => screen.key === key)?.essential;
  return essential ? { ...rule, enabled: true } : rule;
}

/** The heading a screen should show: the dashboard's, if it set one. */
export function screenTitleFor(pathname: string, fallback: string): string {
  const title = screenRuleFor(pathname)?.title?.trim();
  return title || fallback;
}
