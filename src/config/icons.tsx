import React from 'react';

import {
  Apps, ArrowRight, Ascendant, Baby, Bell, Calendar, ChatDots, Check, Clock, Compass,
  DashaWheel, Diya, Gem, Grid, Headphones, Home, Kalash, KundliChart, Lotus, MatchRings,
  MessageSquare, Moon, Numerals, Orbit, Palette, Phone, QuestionMark, Reading,
  Search, SealCheck, Shield, SolarYear, Star, Sunrise, Swap, User, type IconProps,
} from '@/icons';

/**
 * Every icon the dashboard can put on a tab, a shortcut or a menu row, by
 * the name the config stores. The service icons keep the names they already
 * had in `src/data/services.ts`, so a service's icon and a shortcut to it can
 * never disagree.
 */
export const APP_ICONS = {
  home: { label: 'Home', component: Home, fillable: true },
  apps: { label: 'All services', component: Apps, fillable: true },
  chat: { label: 'Chat', component: ChatDots, fillable: true },
  phone: { label: 'Phone', component: Phone, fillable: true },
  diya: { label: 'Diyo (oil lamp)', component: Diya, fillable: true },
  kalash: { label: 'Kalash', component: Kalash, fillable: false },
  message: { label: 'Message', component: MessageSquare, fillable: false },
  headphones: { label: 'Headphones', component: Headphones, fillable: false },
  star: { label: 'Star', component: Star, fillable: false },
  moon: { label: 'Moon', component: Moon, fillable: true },
  ascendant: { label: 'Rising lagna', component: Ascendant, fillable: false },
  year: { label: 'Solar year', component: SolarYear, fillable: false },
  bell: { label: 'Bell', component: Bell, fillable: false },
  reading: { label: 'Reading', component: Reading, fillable: false },
  user: { label: 'Person', component: User, fillable: false },
  sunrise: { label: 'Sunrise', component: Sunrise, fillable: false },
  grid: { label: 'Calendar grid', component: Grid, fillable: false },
  calendar: { label: 'Calendar', component: Calendar, fillable: false },
  swap: { label: 'Swap', component: Swap, fillable: false },
  kundli: { label: 'Kundli', component: KundliChart, fillable: false },
  dasha: { label: 'Dasha wheel', component: DashaWheel, fillable: false },
  rings: { label: 'Rings', component: MatchRings, fillable: false },
  shield: { label: 'Shield', component: Shield, fillable: false },
  clock: { label: 'Clock', component: Clock, fillable: false },
  palette: { label: 'Palette', component: Palette, fillable: false },
  numerals: { label: 'Numerals', component: Numerals, fillable: false },
  gem: { label: 'Gem', component: Gem, fillable: false },
  baby: { label: 'Baby', component: Baby, fillable: false },
  orbit: { label: 'Orbit', component: Orbit, fillable: false },
  question: { label: 'Question', component: QuestionMark, fillable: false },
  compass: { label: 'Compass', component: Compass, fillable: false },
  lotus: { label: 'Lotus', component: Lotus, fillable: false },
  search: { label: 'Search', component: Search, fillable: false },
  check: { label: 'Tick', component: Check, fillable: false },
  verified: { label: 'Verified seal', component: SealCheck, fillable: false },
  arrow: { label: 'Arrow', component: ArrowRight, fillable: false },
} satisfies Record<
  string,
  {
    label: string;
    component: React.ComponentType<IconProps & { filled?: boolean }>;
    fillable: boolean;
  }
>;

export type AppIconName = keyof typeof APP_ICONS;

/**
 * Names a published config may still carry for icons that are gone, and what
 * each now draws. The sparkle (the Services tab, Varshaphal) read as "AI
 * magic"; the praying hands (the Remedies tab) could not be told from a
 * candle at tab size. The four tiles and the diyo say the same thing plainly.
 */
const RETIRED_ICONS: Record<string, AppIconName> = {
  sparkle: 'apps',
  praying: 'diya',
};

export const APP_ICON_NAMES = Object.keys(APP_ICONS) as AppIconName[];

/** An icon by its stored name; a star for a name that no longer exists. */
export function AppIcon({
  name,
  filled,
  ...props
}: IconProps & { name: string; filled?: boolean }) {
  const entry = APP_ICONS[(RETIRED_ICONS[name] ?? name) as AppIconName] ?? APP_ICONS.star;
  const Icon = entry.component as React.ComponentType<IconProps & { filled?: boolean }>;
  return entry.fillable ? <Icon {...props} filled={filled} /> : <Icon {...props} />;
}
