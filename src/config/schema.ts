/**
 * The shape of everything the admin dashboard can change.
 *
 * One `AppConfig` describes the whole app: its name and logo, its colours and
 * type, the order of the home screen, the tabs, every service, astrologer and
 * remedy, the words on the screens, and the switches that turn parts of it
 * off. The dashboard edits a draft copy; publishing makes it the live one,
 * and `apply.ts` writes the live one into the running app.
 *
 * It is plain JSON on purpose — no functions, no class instances, no
 * `require()`d assets — so it can be saved to storage, exported to a file,
 * synced to a server and imported on another device unchanged. Bundled photos
 * are referred to by name (`scene:pooja`), never by the asset itself.
 */
import type { ColorToken } from '@/theme/colors';

export const CONFIG_SCHEMA_VERSION = 1;

/* ------------------------------------------------------------------ *
 * Shared
 * ------------------------------------------------------------------ */

/**
 * A picture, as the config stores it: an https URL, a `data:` URI from an
 * upload, or `scene:<key>` for one of the photographs bundled with the app.
 * An empty string means "none".
 */
export type ImageRef = string;

/** A route in the app (`/kundli`, `/page/about`) or an https link. */
export type LinkRef = string;

/** A name from the icon registry in `src/config/icons.tsx`. */
export type IconName = string;

/* ------------------------------------------------------------------ *
 * Branding
 * ------------------------------------------------------------------ */

export type LogoShape = 'circle' | 'rounded' | 'square';

export type Currency = {
  /** ISO code, printed when `style` is `code`: "USD 0.49". */
  code: string;
  /** Printed when `style` is `symbol`: "$0.49". */
  symbol: string;
  style: 'code' | 'symbol';
  decimals: number;
  /** What follows a per-minute rate: "/min". */
  perMinute: string;
};

export type Branding = {
  appName: string;
  tagline: string;
  logo: ImageRef;
  /** Letters drawn in the mark when there is no logo image. */
  logoMark: string;
  logoShape: LogoShape;
  /** Fill behind the mark and the loading screen. Empty uses the brand colour. */
  logoBackground: string;
  showLogoOnHome: boolean;
  supportEmail: string;
  supportPhone: string;
  website: string;
  socials: {
    facebook: string;
    instagram: string;
    youtube: string;
    tiktok: string;
    x: string;
  };
  currency: Currency;
  /** One small line at the foot of the profile screen. */
  footer: string;
};

/* ------------------------------------------------------------------ *
 * Design
 * ------------------------------------------------------------------ */

export type ThemeConfig = {
  /** The preset this palette started from, for the dashboard's label only. */
  presetId: string;
  colors: Record<ColorToken, string>;
};

export type TypeStep =
  | 'display'
  | 'title'
  | 'section'
  | 'body'
  | 'label'
  | 'small'
  | 'caption'
  | 'button';

export type Weight = 'regular' | 'medium' | 'semibold' | 'bold';

export type TypeStepConfig = { fontSize: number; lineHeight: number; weight: Weight };

export type TypographyConfig = {
  /** Multiplies every font size in the app, including ones off the scale. */
  scale: number;
  steps: Record<TypeStep, TypeStepConfig>;
};

export type SpaceStep = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
export type RadiusStep = 'sm' | 'md' | 'lg' | 'pill';

export type LayoutConfig = {
  gutter: number;
  maxWidth: number;
  tabBarHeight: number;
  touchSize: number;
  space: Record<SpaceStep, number>;
  radius: Record<RadiusStep, number>;
};

/* ------------------------------------------------------------------ *
 * Home and navigation
 * ------------------------------------------------------------------ */

export type HomeSectionId =
  | 'notice'
  | 'banners'
  | 'quick'
  | 'nextReading'
  | 'daily'
  | 'availableNow'
  | 'panchang'
  | 'bookCall';

export type HomeSection = { id: HomeSectionId; visible: boolean; title: string };

export type QuickLink = { id: string; label: string; icon: IconName; href: LinkRef };

export type HomeConfig = {
  sections: HomeSection[];
  quickLinks: QuickLink[];
  showSearch: boolean;
  searchPlaceholder: string;
};

export type TabId = 'index' | 'services' | 'chat' | 'call' | 'remedies';

export type TabConfig = { id: TabId; title: string; icon: IconName; visible: boolean };

export type MenuItem = { id: string; label: string; icon: IconName; href: LinkRef };

export type MenuGroup = { id: string; title: string; items: MenuItem[] };

export type NavigationConfig = {
  tabs: TabConfig[];
  landingTab: TabId;
  profileMenu: MenuGroup[];
};

/* ------------------------------------------------------------------ *
 * Screens and custom pages
 * ------------------------------------------------------------------ */

export type ScreenRule = {
  enabled: boolean;
  /** Replaces the screen's own heading. Empty keeps it. */
  title: string;
  /** Shown instead of the screen while it is turned off. */
  message: string;
};

export type Tone = 'brand' | 'success' | 'danger' | 'neutral';

export type PageBlock =
  | { id: string; type: 'heading'; text: string; size: 'lg' | 'md' }
  | { id: string; type: 'text'; text: string }
  | { id: string; type: 'image'; image: ImageRef; caption: string; height: number }
  | { id: string; type: 'button'; label: string; href: LinkRef; variant: 'solid' | 'outline' }
  | { id: string; type: 'callout'; title: string; text: string; tone: Tone }
  | { id: string; type: 'list'; items: string[]; ordered: boolean }
  | { id: string; type: 'quote'; text: string; cite: string }
  | { id: string; type: 'faq'; items: { q: string; a: string }[] }
  | { id: string; type: 'facts'; rows: { label: string; value: string }[] }
  | { id: string; type: 'astrologer'; astrologerId: string }
  | { id: string; type: 'service'; serviceId: string }
  | { id: string; type: 'divider' }
  | { id: string; type: 'spacer'; size: number };

export type PageBlockType = PageBlock['type'];

export type CustomPage = {
  id: string;
  /** The page lives at `/page/<slug>`. */
  slug: string;
  title: string;
  subtitle: string;
  published: boolean;
  blocks: PageBlock[];
  updatedAt: number;
};

/* ------------------------------------------------------------------ *
 * Catalogue
 * ------------------------------------------------------------------ */

export type ServiceGroupId = 'daily' | 'chart' | 'timing' | 'remedy';

export type ServiceGroupConfig = { id: ServiceGroupId; title: string; np: string };

export type ServiceRecord = {
  id: string;
  href: string;
  name: string;
  np: string;
  tagline: string;
  icon: IconName;
  group: ServiceGroupId;
  needsBirth: boolean;
  needsTime: boolean;
  hidden: boolean;
  /** A short word on the card — "New", "Popular". Empty for none. */
  badge: string;
};

export type ServicesConfig = { groups: ServiceGroupConfig[]; items: ServiceRecord[] };

export type Listing = 'featured' | 'chat' | 'call';

export type AstrologerRecord = {
  id: string;
  name: string;
  photo: ImageRef;
  skills: string;
  languages: string;
  experience: number | null;
  rate: number;
  discountedRate: number | null;
  orders: string;
  rating: number | null;
  verified: boolean;
  celebrity: boolean;
  waitTime: string;
  online: boolean;
  about: string;
  specialities: string[];
  /** Which directories list this astrologer. */
  listings: Listing[];
};

export type AstrologersConfig = {
  roster: AstrologerRecord[];
  /** AI Astrologer Baba — the fields a person sees on his card. */
  ai: {
    enabled: boolean;
    name: string;
    photo: ImageRef;
    skills: string;
    languages: string;
    about: string;
  };
  filters: { id: string; label: string }[];
  ongoing: {
    visible: boolean;
    id: string;
    name: string;
    photo: ImageRef;
    status: string;
    verified: boolean;
  };
  freeMinute: {
    enabled: boolean;
    /** Empty picks the best-rated astrologer on the chat list. */
    astrologerId: string;
    city: string;
    distance: string;
  };
};

export type RemedyRecord = {
  id: string;
  title: string;
  description: string;
  image: ImageRef;
  imageAlt: string;
  imageCredit: string;
  price: number;
  lead: string;
  includes: string[];
  hidden: boolean;
};

/* ------------------------------------------------------------------ *
 * Media, words, engagement, AI
 * ------------------------------------------------------------------ */

export type MediaItem = {
  id: string;
  name: string;
  /** An https URL or a `data:` URI. Bundled scenes are not stored here. */
  uri: string;
  addedAt: number;
  addedBy: string;
  /** Rough size in bytes, for uploads. */
  bytes: number;
};

export type MediaConfig = {
  library: MediaItem[];
  /** A bundled photograph swapped for another picture, everywhere it is used. */
  sceneOverrides: Record<string, { image: ImageRef; alt: string; credit: string }>;
};

export type ContentConfig = {
  /** Overrides for the keys in `src/config/strings.ts`. Missing keys use the default. */
  strings: Record<string, string>;
  chatPrompts: string[];
  babaPrompts: string[];
  cannedReplies: string[];
  languages: string[];
};

export type Schedule = {
  /** Epoch ms; 0 for "no limit". */
  startsAt: number;
  endsAt: number;
};

export type Banner = {
  id: string;
  title: string;
  body: string;
  image: ImageRef;
  ctaLabel: string;
  href: LinkRef;
  background: string;
  foreground: string;
  enabled: boolean;
  dismissible: boolean;
  schedule: Schedule;
};

export type EngagementConfig = {
  banners: Banner[];
  popup: {
    enabled: boolean;
    /** Changing it shows the popup again to people who closed the last one. */
    id: string;
    title: string;
    body: string;
    image: ImageRef;
    ctaLabel: string;
    href: LinkRef;
    schedule: Schedule;
  };
  notice: {
    enabled: boolean;
    text: string;
    href: LinkRef;
    tone: Tone;
  };
  maintenance: {
    enabled: boolean;
    title: string;
    message: string;
    /** Free text: "back by 6 pm". */
    eta: string;
  };
};

export type AiConfig = {
  model: string;
  /** Baba's chat. */
  chatTemperature: number;
  chatMaxTokens: number;
  /** The five-hourly readings. */
  readingTemperature: number;
  /** Extra lines added to the end of Baba's instructions. */
  personaNotes: string;
  /** Extra lines added to the end of the reading writer's instructions. */
  readingNotes: string;
};

export type Features = {
  /** "Pull down to refresh" on the home screen. */
  pullToRefresh: boolean;
  /** Shows the "Chat in progress" card on the directories. */
  sessionPill: boolean;
  /** Filter chips on the directories. */
  directoryFilters: boolean;
};

/* ------------------------------------------------------------------ *
 * The whole thing
 * ------------------------------------------------------------------ */

export type ConfigMeta = {
  /** Counts publishes; a device ignores a synced config older than its own. */
  revision: number;
  publishedAt: number;
  publishedBy: string;
  note: string;
};

export type AppConfig = {
  schemaVersion: number;
  meta: ConfigMeta;
  branding: Branding;
  theme: ThemeConfig;
  typography: TypographyConfig;
  layout: LayoutConfig;
  home: HomeConfig;
  navigation: NavigationConfig;
  screens: Record<string, ScreenRule>;
  pages: CustomPage[];
  services: ServicesConfig;
  astrologers: AstrologersConfig;
  remedies: RemedyRecord[];
  media: MediaConfig;
  content: ContentConfig;
  engagement: EngagementConfig;
  ai: AiConfig;
  features: Features;
};

/** The top-level parts, each of which the dashboard can reset on its own. */
export type ConfigArea = Exclude<keyof AppConfig, 'schemaVersion' | 'meta'>;

export const CONFIG_AREAS: { id: ConfigArea; label: string }[] = [
  { id: 'branding', label: 'Branding' },
  { id: 'theme', label: 'Colours' },
  { id: 'typography', label: 'Typography' },
  { id: 'layout', label: 'Layout' },
  { id: 'home', label: 'Home screen' },
  { id: 'navigation', label: 'Navigation' },
  { id: 'screens', label: 'Screens' },
  { id: 'pages', label: 'Pages' },
  { id: 'services', label: 'Services' },
  { id: 'astrologers', label: 'Astrologers' },
  { id: 'remedies', label: 'Remedies' },
  { id: 'media', label: 'Media' },
  { id: 'content', label: 'Text and prompts' },
  { id: 'engagement', label: 'Announcements' },
  { id: 'ai', label: 'AI astrologer' },
  { id: 'features', label: 'Features' },
];
