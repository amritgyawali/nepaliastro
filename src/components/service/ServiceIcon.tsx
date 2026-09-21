import React from 'react';

import type { ServiceIcon as ServiceIconId } from '@/data/services';
import {
  Baby, Calendar, Clock, Compass, DashaWheel, Gem, Grid, KundliChart, Lotus,
  MatchRings, Numerals, Orbit, Palette, PrayingHands, QuestionMark, Shield,
  Sparkle, Star, Sunrise, Swap, type IconProps,
} from '@/icons';

const ICONS: Record<ServiceIconId, React.ComponentType<IconProps>> = {
  sunrise: Sunrise,
  grid: Grid,
  swap: Swap,
  star: Star,
  kundli: KundliChart,
  dasha: DashaWheel,
  rings: MatchRings,
  shield: Shield,
  clock: Clock,
  calendar: Calendar,
  palette: Palette,
  numerals: Numerals,
  gem: Gem,
  baby: Baby,
  orbit: Orbit,
  question: QuestionMark,
  compass: Compass,
  lotus: Lotus,
  sparkle: Sparkle,
  praying: PrayingHands,
};

/** Resolves a service's icon id to its component. */
export function ServiceIcon({ name, ...props }: IconProps & { name: ServiceIconId }) {
  const Icon = ICONS[name] ?? Star;
  return <Icon {...props} />;
}
