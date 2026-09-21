/**
 * The panchang — the five limbs of the day.
 *
 * Tithi, vara, nakshatra, yoga and karana, each with the moment it actually
 * ends. That last part is what separates a panchang from a horoscope widget:
 * a tithi is not a day, it is a span of the moon pulling 12° ahead of the
 * sun, and it can start at four in the afternoon and end at nine the next
 * morning. Fasts, festivals and rituals are fixed to the tithi running at a
 * particular time, so the end times are computed by root-finding on the real
 * ephemeris rather than by dividing the month into thirty equal pieces.
 */
import {
  angleDelta,
  norm360,
  riseSet,
  siderealLongitude,
} from './ephemeris';
import { KATHMANDU, type Place } from './places';
import { NAKSHATRAS, RASHIS, nakshatraAt, type NakshatraMeta } from './signs';
import { VARA, startOfNepaliDay, nepaliClock } from './time';

/* ------------------------------------------------------------------ *
 * Finding the moment an anga ends
 * ------------------------------------------------------------------ */

const MINUTE = 60_000;

/**
 * The instant the running anga gives way to the next.
 *
 * `value` is an angle that climbs steadily — the moon's lead on the sun for a
 * tithi, the moon's own longitude for a nakshatra — and an anga ends when it
 * crosses the next multiple of `span`. Both are monotonic over the couple of
 * days searched, so a bisection converges quickly and exactly; the result is
 * rounded to the minute, which is the precision a panchang is printed at.
 */
function angaEnd(
  from: Date,
  value: (at: Date) => number,
  span: number,
  searchDays = 2,
): Date {
  const current = value(from);
  const target = (Math.floor(norm360(current) / span) + 1) * span;

  // Negative while the angle is still short of the boundary, positive after.
  const gap = (at: Date) => angleDelta(target % 360, value(at));

  let low = from.getTime();
  let high = from.getTime() + searchDays * 86400_000;

  // If it has not crossed within the window, give the window's end rather
  // than loop — no real anga is longer than this.
  if (gap(new Date(high)) < 0) return new Date(high);

  for (let i = 0; i < 60 && high - low > MINUTE; i += 1) {
    const mid = (low + high) / 2;
    if (gap(new Date(mid)) < 0) low = mid;
    else high = mid;
  }

  return new Date(Math.round(high / MINUTE) * MINUTE);
}

/** The angle a tithi is measured by: how far the moon leads the sun. */
function tithiAngle(at: Date): number {
  return norm360(siderealLongitude('moon', at) - siderealLongitude('sun', at));
}

/** The angle a yoga is measured by: the two longitudes added together. */
function yogaAngle(at: Date): number {
  return norm360(siderealLongitude('moon', at) + siderealLongitude('sun', at));
}

function moonAngle(at: Date): number {
  return siderealLongitude('moon', at);
}

/* ------------------------------------------------------------------ *
 * Names
 * ------------------------------------------------------------------ */

const TITHI_NAMES = [
  'Pratipada', 'Dwitiya', 'Tritiya', 'Chaturthi', 'Panchami',
  'Shashthi', 'Saptami', 'Ashtami', 'Navami', 'Dashami',
  'Ekadashi', 'Dwadashi', 'Trayodashi', 'Chaturdashi',
] as const;

const TITHI_NP = [
  'प्रतिपदा', 'द्वितीया', 'तृतीया', 'चतुर्थी', 'पञ्चमी',
  'षष्ठी', 'सप्तमी', 'अष्टमी', 'नवमी', 'दशमी',
  'एकादशी', 'द्वादशी', 'त्रयोदशी', 'चतुर्दशी',
] as const;

const YOGA_NAMES = [
  'Vishkambha', 'Priti', 'Ayushman', 'Saubhagya', 'Shobhana', 'Atiganda',
  'Sukarma', 'Dhriti', 'Shula', 'Ganda', 'Vriddhi', 'Dhruva', 'Vyaghata',
  'Harshana', 'Vajra', 'Siddhi', 'Vyatipata', 'Variyana', 'Parigha', 'Shiva',
  'Siddha', 'Sadhya', 'Shubha', 'Shukla', 'Brahma', 'Indra', 'Vaidhriti',
] as const;

/** The nine yogas classically marked as inauspicious for new work. */
const HARSH_YOGAS = new Set([
  'Vishkambha', 'Atiganda', 'Shula', 'Ganda', 'Vyaghata',
  'Vajra', 'Vyatipata', 'Parigha', 'Vaidhriti',
]);

const MOVABLE_KARANAS = [
  'Bava', 'Balava', 'Kaulava', 'Taitila', 'Gara', 'Vanija', 'Vishti',
] as const;

const FIXED_KARANAS = ['Shakuni', 'Chatushpada', 'Naga', 'Kimstughna'] as const;

/**
 * The karana of a half-tithi, 1–60 through the lunar month.
 *
 * Four karanas are fixed to the turn of the month and the seven movable ones
 * cycle eight times between them. Vishti — Bhadra — is the one people avoid:
 * nothing auspicious is begun under it.
 */
function karanaName(halfTithi: number): string {
  if (halfTithi === 1) return 'Kimstughna';
  if (halfTithi >= 58) return FIXED_KARANAS[halfTithi - 58];
  return MOVABLE_KARANAS[(halfTithi - 2) % 7];
}

/* ------------------------------------------------------------------ *
 * The five limbs
 * ------------------------------------------------------------------ */

export type Tithi = {
  /** 1–30 across both fortnights. */
  index: number;
  /** 1–15 within the fortnight. */
  within: number;
  name: string;
  np: string;
  paksha: 'Shukla' | 'Krishna';
  endsAt: Date;
  /** 0–1 through the synodic month, for drawing the moon. */
  phase: number;
};

export function tithiAt(at: Date): Tithi {
  const angle = tithiAngle(at);
  const index = Math.floor(angle / 12) + 1;
  const waxing = index <= 15;
  const within = waxing ? index : index - 15;

  let name: string;
  let np: string;
  if (within === 15) {
    name = waxing ? 'Purnima' : 'Amavasya';
    np = waxing ? 'पूर्णिमा' : 'औंसी';
  } else {
    name = TITHI_NAMES[within - 1];
    np = TITHI_NP[within - 1];
  }

  return {
    index,
    within,
    name,
    np,
    paksha: waxing ? 'Shukla' : 'Krishna',
    endsAt: angaEnd(at, tithiAngle, 12),
    phase: angle / 360,
  };
}

export type NakshatraToday = {
  meta: NakshatraMeta;
  pada: number;
  endsAt: Date;
};

export function nakshatraToday(at: Date): NakshatraToday {
  const moon = moonAngle(at);
  const { meta, pada } = nakshatraAt(moon);
  return { meta, pada, endsAt: angaEnd(at, moonAngle, 360 / 27) };
}

export type Yoga = {
  index: number;
  name: string;
  /** True for the nine yogas under which new work is traditionally deferred. */
  harsh: boolean;
  endsAt: Date;
};

export function yogaAt(at: Date): Yoga {
  const angle = yogaAngle(at);
  const index = Math.floor(angle / (360 / 27)) % 27;
  const name = YOGA_NAMES[index];
  return {
    index,
    name,
    harsh: HARSH_YOGAS.has(name),
    endsAt: angaEnd(at, yogaAngle, 360 / 27),
  };
}

export type Karana = {
  name: string;
  /** Vishti (Bhadra) — the half-tithi nothing is started under. */
  vishti: boolean;
  endsAt: Date;
};

export function karanaAt(at: Date): Karana {
  const halfTithi = Math.floor(tithiAngle(at) / 6) + 1;
  const name = karanaName(halfTithi);
  return {
    name,
    vishti: name === 'Vishti',
    endsAt: angaEnd(at, tithiAngle, 6),
  };
}

/* ------------------------------------------------------------------ *
 * The day's windows
 * ------------------------------------------------------------------ */

export type Window = {
  name: string;
  from: Date;
  to: Date;
  /** How to read it: something to use, to avoid, or merely to note. */
  quality: 'good' | 'bad' | 'neutral';
  about: string;
};

/**
 * Which eighth of the daylight each inauspicious period falls in, by weekday.
 *
 * Daylight is cut into eight equal parts — equal by the sun, so the parts are
 * longer in summer — and these tables say which part belongs to Rahu, to
 * Yama and to Gulika on each day of the week.
 */
const RAHU_PART = [8, 2, 7, 5, 6, 4, 3];
const YAMAGANDA_PART = [5, 4, 3, 2, 1, 7, 6];
const GULIKA_PART = [7, 6, 5, 4, 3, 2, 1];

/** The seven choghadiya, in the order they cycle. */
const CHOGHADIYA = [
  { name: 'Udveg', quality: 'bad' as const, about: 'Restless — routine work only' },
  { name: 'Char', quality: 'good' as const, about: 'Moving — best for travel' },
  { name: 'Labh', quality: 'good' as const, about: 'Gain — trade, money, new accounts' },
  { name: 'Amrit', quality: 'good' as const, about: 'Nectar — the best window of the day' },
  { name: 'Kaal', quality: 'bad' as const, about: 'Consuming — begin nothing' },
  { name: 'Shubh', quality: 'good' as const, about: 'Auspicious — ceremony, marriage' },
  { name: 'Rog', quality: 'bad' as const, about: 'Illness — avoid, except to confront a rival' },
];

/** Where each weekday's day and night choghadiya cycles begin. */
const CHOGHADIYA_DAY_START = [0, 3, 6, 2, 5, 1, 4];
const CHOGHADIYA_NIGHT_START = [5, 1, 4, 0, 3, 6, 2];

/** The Chaldean order the hora runs in, slowest planet first. */
const HORA_ORDER = ['saturn', 'jupiter', 'mars', 'sun', 'venus', 'mercury', 'moon'] as const;
const HORA_LABEL: Record<(typeof HORA_ORDER)[number], { name: string; about: string }> = {
  saturn: { name: 'Shani', about: 'Labour, repair, anything slow and lasting' },
  jupiter: { name: 'Guru', about: 'Teaching, advice, ceremony, money matters' },
  mars: { name: 'Mangal', about: 'Confrontation, surgery, physical work' },
  sun: { name: 'Surya', about: 'Authority, government, dealing with elders' },
  venus: { name: 'Shukra', about: 'Marriage, art, buying beautiful things' },
  mercury: { name: 'Budha', about: 'Study, writing, negotiation, trade' },
  moon: { name: 'Chandra', about: 'Travel, water, women, matters of feeling' },
};

function slice(from: Date, to: Date, parts: number, index: number): { from: Date; to: Date } {
  const length = (to.getTime() - from.getTime()) / parts;
  return {
    from: new Date(from.getTime() + length * index),
    to: new Date(from.getTime() + length * (index + 1)),
  };
}

export type DayWindows = {
  rahuKaal: Window;
  yamaganda: Window;
  gulika: Window;
  /** The one muhurta of the day nothing can spoil — except on a Wednesday. */
  abhijit: Window | null;
  choghadiyaDay: Window[];
  choghadiyaNight: Window[];
  hora: Window[];
};

function dayWindows(sunrise: Date, sunset: Date, nextSunrise: Date, weekday: number): DayWindows {
  const rahu = slice(sunrise, sunset, 8, RAHU_PART[weekday] - 1);
  const yama = slice(sunrise, sunset, 8, YAMAGANDA_PART[weekday] - 1);
  const gulika = slice(sunrise, sunset, 8, GULIKA_PART[weekday] - 1);

  // Abhijit is the eighth of the day's fifteen muhurtas — noon, give or take
  // twenty minutes. It is held to override most flaws in a day, though not
  // on Wednesday, which is Budha's own.
  const abhijitSlice = slice(sunrise, sunset, 15, 7);

  const choghadiyaDay = Array.from({ length: 8 }, (_, i) => {
    const kind = CHOGHADIYA[(CHOGHADIYA_DAY_START[weekday] + i) % 7];
    const { from, to } = slice(sunrise, sunset, 8, i);
    return { name: kind.name, from, to, quality: kind.quality, about: kind.about };
  });

  const choghadiyaNight = Array.from({ length: 8 }, (_, i) => {
    const kind = CHOGHADIYA[(CHOGHADIYA_NIGHT_START[weekday] + i) % 7];
    const { from, to } = slice(sunset, nextSunrise, 8, i);
    return { name: kind.name, from, to, quality: kind.quality, about: kind.about };
  });

  // The first hora of a day belongs to that day's own lord, and the rest
  // follow the Chaldean order backwards, one to the hour from sunrise.
  const firstLord = HORA_ORDER.indexOf(
    VARA[weekday].lord.toLowerCase() as (typeof HORA_ORDER)[number],
  );
  const hora = Array.from({ length: 24 }, (_, i) => {
    const lord = HORA_ORDER[(firstLord + i * 3) % 7];
    const label = HORA_LABEL[lord];
    return {
      name: `${label.name} hora`,
      from: new Date(sunrise.getTime() + i * 3600_000),
      to: new Date(sunrise.getTime() + (i + 1) * 3600_000),
      quality: 'neutral' as const,
      about: label.about,
    };
  });

  return {
    rahuKaal: {
      name: 'Rahu Kaal', ...rahu, quality: 'bad',
      about: 'Begin nothing new — no journey, no signing, no ceremony',
    },
    yamaganda: {
      name: 'Yamaganda', ...yama, quality: 'bad',
      about: 'Avoid for anything to do with health or travel',
    },
    gulika: {
      name: 'Gulika Kaal', ...gulika, quality: 'bad',
      about: 'Whatever begins here repeats — good only for what you want to recur',
    },
    abhijit:
      weekday === 3
        ? null
        : {
            name: 'Abhijit Muhurta', ...abhijitSlice, quality: 'good',
            about: 'The day’s strongest window — it overrides most other flaws',
          },
    choghadiyaDay,
    choghadiyaNight,
    hora,
  };
}

/* ------------------------------------------------------------------ *
 * Season, half-year, era
 * ------------------------------------------------------------------ */

const RITUS = [
  { name: 'Shishira', np: 'शिशिर', en: 'Late winter' },
  { name: 'Vasanta', np: 'वसन्त', en: 'Spring' },
  { name: 'Grishma', np: 'ग्रीष्म', en: 'Summer' },
  { name: 'Varsha', np: 'वर्षा', en: 'Monsoon' },
  { name: 'Sharad', np: 'शरद', en: 'Autumn' },
  { name: 'Hemanta', np: 'हेमन्त', en: 'Early winter' },
];

/* ------------------------------------------------------------------ *
 * The whole panchang
 * ------------------------------------------------------------------ */

export type Panchang = {
  date: Date;
  place: Place;
  weekday: (typeof VARA)[number];
  sunrise: Date | null;
  sunset: Date | null;
  moonrise: Date | null;
  moonset: Date | null;
  /** Minutes of daylight. */
  dayLength: number | null;
  tithi: Tithi;
  nakshatra: NakshatraToday;
  yoga: Yoga;
  karana: Karana;
  /** Sidereal sign the sun stands in — the solar month. */
  solarRashi: string;
  ritu: { name: string; np: string; en: string };
  ayana: 'Uttarayana' | 'Dakshinayana';
  windows: DayWindows | null;
  vikramSamvat: number;
  shakaSamvat: number;
};

/**
 * The panchang for the day an instant falls on.
 *
 * The five limbs are read at sunrise, which is how an almanac states them —
 * "today's tithi" means the one running when the day began, even if it gives
 * way by mid-morning — and each carries the time it ends so nothing is lost.
 */
export function panchangFor(at: Date = new Date(), place: Place = KATHMANDU): Panchang {
  const dayStart = startOfNepaliDay(at);
  const { rise: sunrise, set: sunset } = riseSet('sun', dayStart, place);
  const { rise: moonrise, set: moonset } = riseSet('moon', dayStart, place);
  const nextSunrise = riseSet('sun', new Date(dayStart.getTime() + 86400_000), place).rise;

  // An almanac reads the day from sunrise; with no sunrise to be had, the
  // civil day start stands in so the figures are still defined.
  const reference = sunrise ?? dayStart;
  const clock = nepaliClock(reference);

  const sunLongitude = siderealLongitude('sun', reference);
  const solarSign = Math.floor(sunLongitude / 30) % 12;

  // Vikram Samvat runs 56–57 years ahead of the Gregorian year; the turn is
  // in April, so a month test is enough to pick the right one.
  const vikramSamvat = clock.year + (clock.month >= 4 ? 57 : 56);

  return {
    date: reference,
    place,
    weekday: VARA[clock.weekday],
    sunrise,
    sunset,
    moonrise,
    moonset,
    dayLength:
      sunrise && sunset
        ? Math.round((sunset.getTime() - sunrise.getTime()) / MINUTE)
        : null,
    tithi: tithiAt(reference),
    nakshatra: nakshatraToday(reference),
    yoga: yogaAt(reference),
    karana: karanaAt(reference),
    solarRashi: RASHIS[solarSign].vedic,
    // Ritu tracks the solar month, two signs to a season: the sun entering
    // Makara begins Shishira, Meena begins Vasanta, and so on round.
    ritu: RITUS[Math.floor(((solarSign + 3) % 12) / 2)],
    // The sun turns north at Makara Sankranti and south at Karka.
    ayana: solarSign >= 9 || solarSign < 3 ? 'Uttarayana' : 'Dakshinayana',
    windows:
      sunrise && sunset && nextSunrise
        ? dayWindows(sunrise, sunset, nextSunrise, clock.weekday)
        : null,
    vikramSamvat,
    shakaSamvat: clock.year - (clock.month >= 4 ? 78 : 79),
  };
}

/** The window containing `at`, for "what is running right now". */
export function activeWindow(windows: Window[], at: Date): Window | null {
  return (
    windows.find((w) => at >= w.from && at < w.to) ?? null
  );
}

export { NAKSHATRAS, YOGA_NAMES };
