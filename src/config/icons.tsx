import React from 'react';

import {
  ArrowRight, Baby, Calendar, ChatDots, Check, Clock, Compass, DashaWheel, Gem, Grid,
  Headphones, Home, KundliChart, Lotus, MatchRings, MessageSquare, Numerals, Orbit,
  Palette, Phone, PrayingHands, QuestionMark, Search, SealCheck, Shield, Sparkle, Star,
  Sunrise, Swap, type IconProps,
} from '@/icons';

/**
 * Every icon the dashboard can put on a tab, a shortcut or a menu row, by
 * the name the config stores. The service icons keep the names they already
 * had in `src/data/services.ts`, so a service's icon and a shortcut to it can
 * never disagree.
 */
export const APP_ICONS = {
  home: { label: 'Home', component: Home, fillable: true },
  sparkle: { label: 'Sparkle', component: Sparkle, fillable: false },
  chat: { label: 'Chat', component: ChatDots, fillable: true },
  phone: { label: 'Phone', component: Phone, fillable: true },
  praying: { label: 'Praying hands', component: PrayingHands, fillable: true },
  message: { label: 'Message', component: MessageSquare, fillable: false },
  headphones: { label: 'Headphones', component: Headphones, fillable: false },
  star: { label: 'Star', component: Star, fillable: false },
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

export const APP_ICON_NAMES = Object.keys(APP_ICONS) as AppIconName[];

/** An icon by its stored name; a star for a name that no longer exists. */
export function AppIcon({
  name,
  filled,
  ...props
}: IconProps & { name: string; filled?: boolean }) {
  const entry = APP_ICONS[name as AppIconName] ?? APP_ICONS.star;
  const Icon = entry.component as React.ComponentType<IconProps & { filled?: boolean }>;
  return entry.fillable ? <Icon {...props} filled={filled} /> : <Icon {...props} />;
}
