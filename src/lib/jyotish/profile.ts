/**
 * The bridge from what onboarding collected to what the engine needs.
 *
 * Onboarding asks for a name, a date, a time and a place in the form a person
 * can answer. The engine needs an instant and a set of coordinates. This is
 * the one place that conversion happens, so every screen builds its chart the
 * same way and an unknown birth time is handled identically everywhere.
 */
import type { OnboardingProfile } from '@/store/onboarding';

import { buildChart, type BirthMoment, type Chart } from './chart';
import { KATHMANDU, resolvePlace, type Place } from './places';
import { fromNepaliClock } from './time';

/**
 * The birth instant, or null if no date was given.
 *
 * An unknown birth time is taken as noon. That is the standard convention and
 * the least wrong one available: it puts the moon at most twelve hours from
 * the truth, which keeps the rashi right in almost every case, and the
 * screens that depend on the ascendant say plainly that it is unreliable.
 */
export function birthMomentOf(profile: OnboardingProfile): BirthMoment | null {
  if (!profile.birthDate) return null;

  const { day, month, year } = profile.birthDate;
  const time = profile.birthTime;
  const timeKnown = !profile.birthTimeUnknown && !!time;

  let hour = 12;
  let minute = 0;
  if (timeKnown && time) {
    hour = time.period === 'PM' ? (time.hour % 12) + 12 : time.hour % 12;
    minute = time.minute;
  }

  const place = resolvePlace(profile.birthPlace);
  // A birth abroad was recorded on that country's clock, so the instant is
  // built on the place's own offset rather than on Nepal's.
  const at = new Date(
    fromNepaliClock(year, month, day, hour, minute).getTime() +
      (345 - place.utcOffsetMinutes) * 60_000,
  );

  return { at, place, timeKnown };
}

/** The chart for a profile, or null when there is no birth date yet. */
export function chartFor(profile: OnboardingProfile): Chart | null {
  const moment = birthMomentOf(profile);
  return moment ? buildChart(moment) : null;
}

/** Where the person was born, defaulting to Kathmandu. */
export function placeOf(profile: OnboardingProfile): Place {
  return profile.birthDate ? resolvePlace(profile.birthPlace) : KATHMANDU;
}

/** "19 September 2006, 9:56 PM in Kathmandu" — the details, written out. */
export function describeBirth(moment: BirthMoment): string {
  const local = new Date(
    moment.at.getTime() + moment.place.utcOffsetMinutes * 60_000,
  );
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  const date = `${local.getUTCDate()} ${months[local.getUTCMonth()]} ${local.getUTCFullYear()}`;
  if (!moment.timeKnown) return `${date}, time unknown — in ${moment.place.name}`;

  const hours = local.getUTCHours();
  const minutes = `${local.getUTCMinutes()}`.padStart(2, '0');
  const period = hours >= 12 ? 'PM' : 'AM';
  return `${date}, ${hours % 12 || 12}:${minutes} ${period} in ${moment.place.name}`;
}
