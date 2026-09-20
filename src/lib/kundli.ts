/**
 * Birth-chart facts, derived from the birth details onboarding collected.
 *
 * Only what can honestly be computed appears here: the sidereal sun and moon
 * come from `panchang.ts`, the rashis and nakshatra follow from them, and the
 * ascendant is the classic two-hours-per-sign estimate from sunrise, which
 * the screen labels as an estimate. Nothing is invented to fill a gap — a
 * chart with the other seven grahas needs a real ephemeris, and that is a
 * service call, not a guess.
 */
import type { OnboardingProfile } from '@/store/onboarding';

import {
  KATHMANDU,
  nakshatraAt,
  siderealLongitudes,
  sunTimesFor,
  tithiFor,
  type Nakshatra,
  type Tithi,
} from './panchang';

export type Rashi = {
  index: number;
  /** Sanskrit name, as a Nepali reader expects to see it. */
  vedic: string;
  /** The same sign in the names the rest of the app uses. */
  western: string;
  lord: string;
  element: 'Fire' | 'Earth' | 'Air' | 'Water';
};

export const RASHIS: Rashi[] = [
  { index: 0, vedic: 'Mesha', western: 'Aries', lord: 'Mars', element: 'Fire' },
  { index: 1, vedic: 'Vrishabha', western: 'Taurus', lord: 'Venus', element: 'Earth' },
  { index: 2, vedic: 'Mithuna', western: 'Gemini', lord: 'Mercury', element: 'Air' },
  { index: 3, vedic: 'Karka', western: 'Cancer', lord: 'Moon', element: 'Water' },
  { index: 4, vedic: 'Simha', western: 'Leo', lord: 'Sun', element: 'Fire' },
  { index: 5, vedic: 'Kanya', western: 'Virgo', lord: 'Mercury', element: 'Earth' },
  { index: 6, vedic: 'Tula', western: 'Libra', lord: 'Venus', element: 'Air' },
  { index: 7, vedic: 'Vrishchika', western: 'Scorpio', lord: 'Mars', element: 'Water' },
  { index: 8, vedic: 'Dhanu', western: 'Sagittarius', lord: 'Jupiter', element: 'Fire' },
  { index: 9, vedic: 'Makara', western: 'Capricorn', lord: 'Saturn', element: 'Earth' },
  { index: 10, vedic: 'Kumbha', western: 'Aquarius', lord: 'Saturn', element: 'Air' },
  { index: 11, vedic: 'Meena', western: 'Pisces', lord: 'Jupiter', element: 'Water' },
];

/** The rashi a sidereal longitude falls in. */
export function rashiAt(siderealLongitude: number): Rashi {
  const normalised = ((siderealLongitude % 360) + 360) % 360;
  return RASHIS[Math.floor(normalised / 30) % 12];
}

export type BirthMoment = {
  /** The instant of birth, in Nepal time. */
  at: Date;
  /** False when the user ticked "I don't know my exact birth time". */
  timeKnown: boolean;
  place: string;
};

/**
 * The birth details as a single instant.
 *
 * An unknown birth time is taken as noon — the convention that minimises how
 * far the moon can be wrong over the day — and the screen says so.
 */
export function birthMomentOf(profile: OnboardingProfile): BirthMoment | null {
  if (!profile.birthDate) return null;

  const { day, month, year } = profile.birthDate;
  const time = profile.birthTime;
  const known = !profile.birthTimeUnknown && !!time;

  let hour = 12;
  let minute = 0;
  if (known && time) {
    hour = time.period === 'PM' ? (time.hour % 12) + 12 : time.hour % 12;
    minute = time.minute;
  }

  // Nepal keeps +05:45 all year, so the offset is a constant subtraction.
  const utcMs =
    Date.UTC(year, month - 1, day, hour, minute) - KATHMANDU.utcOffsetMinutes * 60000;

  return {
    at: new Date(utcMs),
    timeKnown: known,
    place: profile.birthPlace.trim() || KATHMANDU.label,
  };
}

export type Kundli = {
  moment: BirthMoment;
  /** Moon sign — the one Vedic astrology means by "your rashi". */
  rashi: Rashi;
  /** Sun sign on the sidereal zodiac, which differs from the western one. */
  sunRashi: Rashi;
  nakshatra: Nakshatra;
  /** Rising sign. An estimate, and only offered when the birth time is known. */
  lagna: Rashi | null;
  tithi: Tithi;
  /** Weekday of birth, e.g. "Tuesday" — the vara of the panchang. */
  vara: string;
};

const WEEKDAYS = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

/**
 * The ascendant, estimated.
 *
 * Each sign takes roughly two hours to rise, and the sign rising at sunrise is
 * the sun's own. That is the approximation every hand-drawn chart starts from;
 * it can be a sign out near the boundaries, which is why the screen marks it.
 */
function estimateLagna(moment: BirthMoment, sunLongitude: number): Rashi | null {
  if (!moment.timeKnown) return null;

  const sunrise = sunTimesFor(moment.at);
  if (sunrise.sunrise === '--:--') return null;

  const [sunriseHour, sunriseMinute] = sunrise.sunrise.split(':').map(Number);
  const local = new Date(moment.at.getTime() + KATHMANDU.utcOffsetMinutes * 60000);
  const minutesAfterSunrise =
    local.getUTCHours() * 60 + local.getUTCMinutes() - (sunriseHour * 60 + sunriseMinute);

  const signsRisen = Math.floor(((minutesAfterSunrise + 1440) % 1440) / 120);
  return RASHIS[(rashiAt(sunLongitude).index + signsRisen) % 12];
}

/** Everything the Kundli screen shows, or `null` if there is no birth date yet. */
export function kundliFor(profile: OnboardingProfile): Kundli | null {
  const moment = birthMomentOf(profile);
  if (!moment) return null;

  const { sun, moon } = siderealLongitudes(moment.at);
  const local = new Date(moment.at.getTime() + KATHMANDU.utcOffsetMinutes * 60000);

  return {
    moment,
    rashi: rashiAt(moon),
    sunRashi: rashiAt(sun),
    nakshatra: nakshatraAt(moon),
    lagna: estimateLagna(moment, sun),
    tithi: tithiFor(moment.at),
    vara: WEEKDAYS[local.getUTCDay()],
  };
}

/** "19 September 2006, 9:56 PM" — the birth details, written out. */
export function formatBirthMoment(moment: BirthMoment): string {
  const local = new Date(moment.at.getTime() + KATHMANDU.utcOffsetMinutes * 60000);
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  const date = `${local.getUTCDate()} ${months[local.getUTCMonth()]} ${local.getUTCFullYear()}`;
  if (!moment.timeKnown) return `${date}, time unknown`;

  const hours = local.getUTCHours();
  const minutes = `${local.getUTCMinutes()}`.padStart(2, '0');
  const period = hours >= 12 ? 'PM' : 'AM';
  return `${date}, ${hours % 12 || 12}:${minutes} ${period}`;
}
