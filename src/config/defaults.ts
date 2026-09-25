/**
 * The config the app ships with, read off the app itself.
 *
 * Nothing here is typed out a second time: the services come from
 * `data/services.ts`, the astrologers from `data/astrologers.ts`, the colours
 * from `theme/colors.ts`, and so on. This module copies them the moment it is
 * first imported — before `apply.ts` has had a chance to write a published
 * config over them — so "reset to default" always means what the code says.
 */
import {
  aiAstrologer,
  callAstrologers,
  chatAstrologers,
  featuredAstrologers,
  ongoingSession,
  topNearbyAstrologer,
  type Astrologer,
} from '@/data/astrologers';
import {
  astroReplies,
  babaPrompts,
  directoryFilters,
  languageOptions,
  profileGroups,
  quickCategories,
  quickPrompts,
  remedyServices,
} from '@/data/content';
import { scenes, type Scene } from '@/data/images';
import { SERVICES, SERVICE_GROUPS } from '@/data/services';
import { AI_MODEL } from '@/lib/groq';
import { themeDefaults } from '@/theme/runtime';

import {
  CONFIG_SCHEMA_VERSION,
  type AppConfig,
  type AstrologerRecord,
  type HomeSection,
  type Listing,
  type TypeStep,
  type Weight,
} from './schema';

/** A JSON-safe deep copy. The config never holds anything JSON cannot. */
export function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

/* ------------------------------------------------------------------ *
 * Photos
 * ------------------------------------------------------------------ */

/** The bundled photographs, by the name the config refers to them with. */
export const SCENE_KEYS = Object.keys(scenes) as (keyof typeof scenes)[];

/** The bundled photographs as they shipped, before any override. */
export const SCENE_ORIGINALS: Record<string, Scene> = Object.fromEntries(
  SCENE_KEYS.map((key) => [key, { ...scenes[key] }]),
);

function sceneRef(scene: unknown): string {
  const key = SCENE_KEYS.find((candidate) => scenes[candidate] === scene);
  return key ? `scene:${key}` : typeof scene === 'string' ? scene : '';
}

/* ------------------------------------------------------------------ *
 * Astrologers
 * ------------------------------------------------------------------ */

function toRecord(astrologer: Astrologer, listings: Listing[]): AstrologerRecord {
  return {
    id: astrologer.id,
    name: astrologer.name,
    photo: astrologer.photo,
    skills: astrologer.skills,
    languages: astrologer.languages,
    experience: astrologer.experience ?? null,
    rate: astrologer.rate,
    discountedRate: astrologer.discountedRate ?? null,
    orders: astrologer.orders ?? '',
    rating: astrologer.rating ?? null,
    verified: astrologer.verified,
    celebrity: !!astrologer.celebrity,
    waitTime: astrologer.waitTime ?? '',
    online: !!astrologer.online,
    about: astrologer.about ?? '',
    specialities: [...astrologer.specialities],
    listings,
  };
}

/**
 * One roster from the three listings. An astrologer who appears on more than
 * one list under the same id becomes one record listed in each.
 */
function roster(): AstrologerRecord[] {
  const byId = new Map<string, AstrologerRecord>();
  const add = (list: Astrologer[], listing: Listing) => {
    for (const astrologer of list) {
      if (astrologer.ai) continue;
      const existing = byId.get(astrologer.id);
      if (existing) {
        if (!existing.listings.includes(listing)) existing.listings.push(listing);
      } else {
        byId.set(astrologer.id, toRecord(astrologer, [listing]));
      }
    }
  };
  add(featuredAstrologers, 'featured');
  add(chatAstrologers, 'chat');
  add(callAstrologers, 'call');
  return [...byId.values()];
}

/* ------------------------------------------------------------------ *
 * Typography
 * ------------------------------------------------------------------ */

const WEIGHT_OF: Record<string, Weight> = {
  Mukta_400Regular: 'regular',
  Mukta_500Medium: 'medium',
  Mukta_600SemiBold: 'semibold',
  Mukta_700Bold: 'bold',
};

function typeSteps(): AppConfig['typography']['steps'] {
  const steps = {} as AppConfig['typography']['steps'];
  for (const [step, style] of Object.entries(themeDefaults.type)) {
    steps[step as TypeStep] = {
      fontSize: style.fontSize ?? 16,
      lineHeight: style.lineHeight ?? Math.round((style.fontSize ?? 16) * 1.45),
      weight: WEIGHT_OF[String(style.fontFamily)] ?? 'regular',
    };
  }
  return steps;
}

/* ------------------------------------------------------------------ *
 * Home
 * ------------------------------------------------------------------ */

const QUICK_LINK_ROUTES: Record<string, string> = {
  'daily-horoscope': '/horoscope',
  patro: '/patro',
  sait: '/muhurta',
  'free-kundli': '/kundli',
};

const HOME_SECTIONS: HomeSection[] = [
  { id: 'notice', visible: true, title: 'Notice' },
  { id: 'banners', visible: true, title: 'Banners' },
  { id: 'quick', visible: true, title: 'Shortcuts' },
  { id: 'nextReading', visible: true, title: 'Your next reading' },
  { id: 'daily', visible: true, title: 'Today’s rashifal' },
  { id: 'availableNow', visible: true, title: 'Available now' },
  { id: 'panchang', visible: true, title: 'Today’s panchang' },
  { id: 'festival', visible: true, title: 'Next festival' },
  { id: 'bookCall', visible: true, title: 'Book a call' },
];

/* ------------------------------------------------------------------ *
 * The whole default
 * ------------------------------------------------------------------ */

const DEFAULT_CONFIG: AppConfig = clone<AppConfig>({
  schemaVersion: CONFIG_SCHEMA_VERSION,
  meta: { revision: 0, publishedAt: 0, publishedBy: '', note: 'As shipped' },

  branding: {
    appName: 'AstroNepali',
    tagline: 'Jyotish, computed on your phone',
    logo: '',
    logoMark: 'ॐ',
    logoShape: 'rounded',
    logoBackground: '',
    showLogoOnHome: false,
    supportEmail: '',
    supportPhone: '',
    website: '',
    socials: { facebook: '', instagram: '', youtube: '', tiktok: '', x: '' },
    currency: { code: 'USD', symbol: '$', style: 'code', decimals: 2, perMinute: '/min' },
    footer: '',
  },

  theme: { presetId: 'saffron', colors: { ...themeDefaults.colors } },

  typography: { scale: 1, steps: typeSteps() },

  layout: {
    gutter: themeDefaults.layout.GUTTER,
    maxWidth: themeDefaults.layout.SCREEN_MAX_WIDTH,
    tabBarHeight: themeDefaults.layout.TAB_BAR_HEIGHT,
    touchSize: themeDefaults.layout.TOUCH_SIZE,
    space: { ...themeDefaults.space },
    radius: { ...themeDefaults.radius },
  },

  home: {
    sections: HOME_SECTIONS,
    quickLinks: quickCategories.map((category) => ({
      id: category.id,
      label: category.label,
      icon: category.icon,
      href: QUICK_LINK_ROUTES[category.id] ?? '/services',
    })),
    showSearch: true,
    searchPlaceholder: 'Search astrologers',
  },

  navigation: {
    tabs: [
      { id: 'index', title: 'Home', icon: 'home', visible: true },
      { id: 'services', title: 'Services', icon: 'apps', visible: true },
      { id: 'chat', title: 'Chat', icon: 'chat', visible: true },
      { id: 'call', title: 'Call', icon: 'phone', visible: true },
      { id: 'remedies', title: 'Remedies', icon: 'diya', visible: true },
    ],
    landingTab: 'index',
    profileMenu: profileGroups.map((group, index) => ({
      id: `group-${index + 1}`,
      title: group.title,
      items: group.items.map((item) => ({
        id: item.id,
        label: item.label,
        icon: item.icon,
        href: item.href,
      })),
    })),
  },

  screens: {},
  pages: [],

  services: {
    groups: SERVICE_GROUPS.map((group) => ({ ...group })),
    items: SERVICES.map((service) => ({
      id: service.id,
      href: service.href,
      name: service.name,
      np: service.np,
      tagline: service.tagline,
      icon: service.icon,
      group: service.group,
      needsBirth: !!service.needsBirth,
      needsTime: !!service.needsTime,
      hidden: false,
      badge: '',
    })),
  },

  astrologers: {
    roster: roster(),
    ai: {
      enabled: true,
      name: aiAstrologer.name,
      photo: aiAstrologer.photo,
      skills: aiAstrologer.skills,
      languages: aiAstrologer.languages,
      about: aiAstrologer.about ?? '',
    },
    filters: directoryFilters.map((filter) => ({ id: filter.id, label: filter.label })),
    ongoing: {
      visible: true,
      id: ongoingSession.id,
      name: ongoingSession.name,
      photo: ongoingSession.photo,
      status: ongoingSession.status,
      verified: ongoingSession.verified,
    },
    freeMinute: {
      enabled: true,
      astrologerId: '',
      city: topNearbyAstrologer.city,
      distance: topNearbyAstrologer.distance,
    },
  },

  remedies: remedyServices.map((remedy) => {
    const scene = remedy.image as unknown as Scene | string;
    return {
      id: remedy.id,
      title: remedy.title,
      description: remedy.description,
      image: sceneRef(scene),
      imageAlt: typeof scene === 'object' ? scene.alt : remedy.title,
      imageCredit: typeof scene === 'object' ? scene.credit : '',
      price: remedy.price,
      lead: remedy.lead,
      includes: [...remedy.includes],
      hidden: false,
    };
  }),

  media: { library: [], sceneOverrides: {} },

  content: {
    strings: {},
    chatPrompts: [...quickPrompts],
    babaPrompts: [...babaPrompts],
    cannedReplies: [...astroReplies],
    languages: [...languageOptions],
  },

  engagement: {
    banners: [],
    popup: {
      enabled: false,
      id: 'welcome-1',
      title: 'Namaste',
      body: '',
      image: '',
      ctaLabel: '',
      href: '',
      schedule: { startsAt: 0, endsAt: 0 },
    },
    notice: { enabled: false, text: '', href: '', tone: 'brand' },
    maintenance: {
      enabled: false,
      title: 'We are making the app better',
      message: 'AstroNepali is closed for a short while for maintenance. Your details are safe.',
      eta: '',
    },
  },

  ai: {
    model: AI_MODEL,
    chatTemperature: 0.75,
    chatMaxTokens: 900,
    readingTemperature: 0.8,
    personaNotes: '',
    readingNotes: '',
  },

  features: { pullToRefresh: true, sessionPill: true, directoryFilters: true },
});

/** A fresh copy of the shipped config, safe to change. */
export function defaultConfig(): AppConfig {
  return clone(DEFAULT_CONFIG);
}
