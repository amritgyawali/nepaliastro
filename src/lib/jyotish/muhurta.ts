/**
 * Sait — choosing the moment.
 *
 * Nepali families do not ask "is today lucky"; they ask "when should we do
 * this particular thing". So the unit here is an activity — a marriage, a
 * bratabandha, moving into a house, opening a shop — and every judgement is
 * made against that activity's own requirements. A day that is excellent for
 * starting a business can be poor for a wedding, and saying so is the whole
 * value of the service.
 *
 * Each day is scored on the five limbs of the panchang plus tarabala and
 * chandrabala from the person's own birth star, and the reasons are returned
 * alongside the score so nothing is a black box.
 */
import { siderealLongitude } from './ephemeris';
import type { Place } from './places';
import { KATHMANDU } from './places';
import { RASHIS } from './signs';
import { panchangFor, type Panchang, type Window } from './panchang';
import { ascendantAt } from './chart';
import type { Chart } from './chart';
import { addDays, nepaliClock, startOfNepaliDay } from './time';

/* ------------------------------------------------------------------ *
 * Activities
 * ------------------------------------------------------------------ */

export type ActivityId =
  | 'marriage' | 'engagement' | 'bratabandha' | 'pasni' | 'chhewar'
  | 'namkaran' | 'grihapravesh' | 'bhumipujan' | 'business' | 'vehicle'
  | 'property' | 'travel' | 'education' | 'agreement' | 'medical';

export type Activity = {
  id: ActivityId;
  name: string;
  np: string;
  about: string;
  /** Nakshatras the classics name as fit for this work. */
  nakshatras: number[];
  /** Weekdays that suit it, 0 = Sunday. */
  varas: number[];
  /** Lagnas that suit it, by sign index; empty means no preference. */
  lagnas: number[];
};

// Nakshatra indices are 0-based from Ashwini, matching the NAKSHATRAS table.
const A = {
  ashwini: 0, bharani: 1, krittika: 2, rohini: 3, mrigashira: 4, ardra: 5,
  punarvasu: 6, pushya: 7, ashlesha: 8, magha: 9, purvaPhalguni: 10,
  uttaraPhalguni: 11, hasta: 12, chitra: 13, swati: 14, vishakha: 15,
  anuradha: 16, jyeshtha: 17, mula: 18, purvaAshadha: 19, uttaraAshadha: 20,
  shravana: 21, dhanishta: 22, shatabhisha: 23, purvaBhadrapada: 24,
  uttaraBhadrapada: 25, revati: 26,
};

export const ACTIVITIES: Activity[] = [
  {
    id: 'marriage', name: 'Marriage', np: 'विवाह',
    about: 'The wedding itself — the lagna matters as much as the day',
    nakshatras: [A.rohini, A.mrigashira, A.magha, A.uttaraPhalguni, A.hasta, A.swati, A.anuradha, A.mula, A.uttaraAshadha, A.uttaraBhadrapada, A.revati],
    varas: [1, 3, 4, 5],
    // Fixed and dual signs hold; movable signs are held to make a union restless.
    lagnas: [1, 4, 7, 10, 2, 5, 8, 11],
  },
  {
    id: 'engagement', name: 'Engagement', np: 'मागी / छिन्ने',
    about: 'Fixing the match, exchanging words between the families',
    nakshatras: [A.rohini, A.mrigashira, A.magha, A.uttaraPhalguni, A.hasta, A.anuradha, A.uttaraAshadha, A.revati],
    varas: [1, 3, 4, 5],
    lagnas: [],
  },
  {
    id: 'bratabandha', name: 'Bratabandha', np: 'व्रतबन्ध',
    about: 'The sacred thread — the boy’s second birth',
    nakshatras: [A.ashwini, A.rohini, A.mrigashira, A.punarvasu, A.pushya, A.uttaraPhalguni, A.hasta, A.chitra, A.swati, A.anuradha, A.uttaraAshadha, A.shravana, A.dhanishta, A.revati],
    varas: [1, 3, 4, 5],
    lagnas: [1, 2, 5, 8, 11],
  },
  {
    id: 'pasni', name: 'Pasni', np: 'पास्नी',
    about: 'The first rice — usually the sixth month for a girl, the fifth for a boy',
    nakshatras: [A.ashwini, A.rohini, A.mrigashira, A.punarvasu, A.pushya, A.uttaraPhalguni, A.hasta, A.chitra, A.swati, A.anuradha, A.shravana, A.dhanishta, A.shatabhisha, A.revati],
    varas: [1, 3, 4, 5],
    lagnas: [],
  },
  {
    id: 'chhewar', name: 'Chhewar', np: 'छेवर',
    about: 'The first haircut, in an odd year of the boy’s life',
    nakshatras: [A.ashwini, A.mrigashira, A.punarvasu, A.pushya, A.hasta, A.chitra, A.swati, A.jyeshtha, A.shravana, A.dhanishta, A.revati],
    varas: [1, 3, 4, 5],
    lagnas: [],
  },
  {
    id: 'namkaran', name: 'Naming', np: 'नामकरण',
    about: 'Giving the child its name, on the eleventh day or after',
    nakshatras: [A.ashwini, A.rohini, A.mrigashira, A.punarvasu, A.pushya, A.uttaraPhalguni, A.hasta, A.chitra, A.anuradha, A.shravana, A.revati],
    varas: [1, 3, 4, 5],
    lagnas: [],
  },
  {
    id: 'grihapravesh', name: 'Griha Pravesh', np: 'गृह प्रवेश',
    about: 'Entering a new house for the first time',
    nakshatras: [A.rohini, A.mrigashira, A.uttaraPhalguni, A.chitra, A.anuradha, A.uttaraAshadha, A.shravana, A.dhanishta, A.shatabhisha, A.uttaraBhadrapada, A.revati],
    varas: [1, 3, 4, 5],
    lagnas: [1, 4, 7, 10],
  },
  {
    id: 'bhumipujan', name: 'Bhumi Pujan', np: 'भूमि पूजा',
    about: 'Breaking ground before building',
    nakshatras: [A.rohini, A.mrigashira, A.uttaraPhalguni, A.chitra, A.anuradha, A.uttaraAshadha, A.dhanishta, A.uttaraBhadrapada, A.revati],
    varas: [1, 3, 4, 5],
    lagnas: [],
  },
  {
    id: 'business', name: 'New business', np: 'व्यापार आरम्भ',
    about: 'Opening a shop, registering a firm, the first transaction',
    nakshatras: [A.ashwini, A.rohini, A.mrigashira, A.pushya, A.uttaraPhalguni, A.hasta, A.chitra, A.swati, A.anuradha, A.uttaraAshadha, A.shravana, A.dhanishta, A.revati],
    varas: [1, 3, 4, 5],
    lagnas: [],
  },
  {
    id: 'vehicle', name: 'Buying a vehicle', np: 'सवारी खरिद',
    about: 'Taking delivery, and the first drive',
    nakshatras: [A.ashwini, A.rohini, A.mrigashira, A.punarvasu, A.pushya, A.hasta, A.chitra, A.swati, A.anuradha, A.shravana, A.dhanishta, A.revati],
    varas: [1, 3, 4, 5],
    lagnas: [],
  },
  {
    id: 'property', name: 'Buying land', np: 'जग्गा खरिद',
    about: 'Registration at the malpot, and taking possession',
    nakshatras: [A.rohini, A.mrigashira, A.uttaraPhalguni, A.chitra, A.anuradha, A.uttaraAshadha, A.dhanishta, A.uttaraBhadrapada, A.revati],
    varas: [1, 3, 4, 5],
    lagnas: [],
  },
  {
    id: 'travel', name: 'Journey', np: 'यात्रा',
    about: 'Leaving home — the direction matters as much as the hour',
    nakshatras: [A.ashwini, A.mrigashira, A.punarvasu, A.pushya, A.hasta, A.anuradha, A.shravana, A.dhanishta, A.revati],
    varas: [1, 3, 4, 5],
    lagnas: [],
  },
  {
    id: 'education', name: 'Starting study', np: 'विद्यारम्भ',
    about: 'A child’s first lesson, or the start of a course',
    nakshatras: [A.ashwini, A.punarvasu, A.pushya, A.hasta, A.chitra, A.swati, A.shravana, A.dhanishta, A.shatabhisha, A.revati],
    varas: [1, 3, 4, 5],
    lagnas: [],
  },
  {
    id: 'agreement', name: 'Signing', np: 'सम्झौता',
    about: 'Contracts, loans, anything that binds you to a term',
    nakshatras: [A.ashwini, A.rohini, A.mrigashira, A.pushya, A.uttaraPhalguni, A.hasta, A.chitra, A.anuradha, A.uttaraAshadha, A.shravana, A.revati],
    varas: [1, 3, 4, 5],
    lagnas: [],
  },
  {
    id: 'medical', name: 'Surgery or treatment', np: 'उपचार',
    about: 'Elective procedures only — an emergency needs no muhurta',
    nakshatras: [A.ashwini, A.bharani, A.krittika, A.ardra, A.ashlesha, A.magha, A.jyeshtha, A.mula, A.shatabhisha],
    varas: [2, 6],
    lagnas: [],
  },
];

export function activityById(id: ActivityId): Activity {
  return ACTIVITIES.find((a) => a.id === id) ?? ACTIVITIES[0];
}

/* ------------------------------------------------------------------ *
 * Tarabala and chandrabala
 * ------------------------------------------------------------------ */

const TARA_NAMES = [
  'Janma', 'Sampat', 'Vipat', 'Kshema', 'Pratyak',
  'Sadhaka', 'Naidhana', 'Mitra', 'Parama Mitra',
];

/** The 3rd, 5th and 7th taras are the ones to step around. */
const TARA_BAD = new Set([3, 5, 7]);

export type Tarabala = { tara: number; name: string; good: boolean };

/** How the day's star stands to the person's birth star. */
export function tarabala(birthNakshatra: number, dayNakshatra: number): Tarabala {
  const steps = ((dayNakshatra - birthNakshatra + 27) % 27) + 1;
  const tara = steps % 9 === 0 ? 9 : steps % 9;
  return { tara, name: TARA_NAMES[tara - 1], good: !TARA_BAD.has(tara) };
}

/** Moon's standing from the birth rashi. The 4th, 8th and 12th are weak. */
export function chandrabala(birthRashi: number, dayMoonRashi: number): {
  house: number;
  good: boolean;
} {
  const house = ((dayMoonRashi - birthRashi + 12) % 12) + 1;
  return { house, good: ![4, 8, 12].includes(house) };
}

/* ------------------------------------------------------------------ *
 * Scoring a day
 * ------------------------------------------------------------------ */

export type Reason = { text: string; weight: number };

export type DayScore = {
  date: Date;
  panchang: Panchang;
  /** 0–100. */
  score: number;
  verdict: 'Excellent' | 'Good' | 'Workable' | 'Avoid';
  reasons: Reason[];
  /** The best clear window in the day, avoiding rahukaal and the bad choghadiya. */
  bestWindow: Window | null;
};

/** The four Rikta tithis, on which nothing auspicious is begun. */
const RIKTA = new Set([4, 9, 14]);

/**
 * Score one day for one activity.
 *
 * Every rule contributes a signed weight and a sentence explaining itself, so
 * the screen can show why a day scored what it did. A person's chart is
 * optional: without it the day is judged on the panchang alone, which is how
 * a general patro does it, and with it tarabala and chandrabala are added.
 */
export function scoreDay(
  date: Date,
  activity: Activity,
  chart: Chart | null,
  place: Place = KATHMANDU,
): DayScore {
  const panchang = panchangFor(date, place);
  const reasons: Reason[] = [];
  let score = 50;

  const add = (text: string, weight: number) => {
    reasons.push({ text, weight });
    score += weight;
  };

  // --- Nakshatra: the single heaviest factor in choosing a sait.
  const nakshatraIndex = panchang.nakshatra.meta.index;
  if (activity.nakshatras.includes(nakshatraIndex)) {
    add(`${panchang.nakshatra.meta.name} is among the nakshatras named for ${activity.name.toLowerCase()}`, 22);
  } else {
    add(`${panchang.nakshatra.meta.name} is not one of the nakshatras named for this work`, -14);
  }

  // --- Vara.
  // Nepal's weekday, not the device's — the whole scoring is for Kathmandu.
  const weekday = nepaliClock(panchang.date).weekday;
  if (activity.varas.includes(weekday)) {
    add(`${panchang.weekday.en} suits this work`, 8);
  } else if (weekday === 2 && activity.id !== 'medical') {
    add('Tuesday is Mangal’s day — generally set aside for anything auspicious', -10);
  } else {
    add(`${panchang.weekday.en} is not the preferred day for this`, -5);
  }

  // --- Tithi.
  if (RIKTA.has(panchang.tithi.within)) {
    add(`${panchang.tithi.name} is a Rikta tithi — traditionally empty-handed`, -14);
  } else if (panchang.tithi.name === 'Amavasya') {
    add('Amavasya — the dark moon, kept for the ancestors rather than new work', -16);
  } else if (panchang.tithi.name === 'Purnima' || [2, 3, 5, 7, 10, 11, 13].includes(panchang.tithi.within)) {
    add(`${panchang.tithi.paksha} ${panchang.tithi.name} is a favourable tithi`, 10);
  }
  if (panchang.tithi.paksha === 'Shukla') {
    add('The moon is waxing, which every muhurta prefers', 6);
  } else {
    add('The moon is waning', -4);
  }

  // --- Yoga and karana.
  if (panchang.yoga.harsh) {
    add(`${panchang.yoga.name} yoga is one of the nine held unfit for new work`, -12);
  } else {
    add(`${panchang.yoga.name} yoga is clear`, 4);
  }
  if (panchang.karana.vishti) {
    add('Vishti (Bhadra) karana is running — nothing auspicious begins under it', -15);
  }

  // --- The person's own chart.
  if (chart) {
    const tara = tarabala(chart.nakshatra.index, nakshatraIndex);
    if (tara.good) add(`${tara.name} tara from your birth star`, 12);
    else add(`${tara.name} tara from your birth star — one of the three to avoid`, -16);

    const moonSign = Math.floor(siderealLongitude('moon', panchang.date) / 30) % 12;
    const bala = chandrabala(chart.rashi.index, moonSign);
    if (bala.good) add(`The moon stands ${bala.house}th from your rashi — good chandrabala`, 10);
    else add(`The moon stands ${bala.house}th from your rashi — weak chandrabala`, -12);
  }

  // --- Lagna preference, judged at the best window rather than the whole day.
  const bestWindow = pickBestWindow(panchang);
  if (activity.lagnas.length && bestWindow) {
    const lagnaSign = Math.floor(ascendantAt(bestWindow.from, place) / 30) % 12;
    if (activity.lagnas.includes(lagnaSign)) {
      add(`${RASHIS[lagnaSign].vedic} lagna rises in the best window, which suits this work`, 8);
    }
  }

  score = Math.max(0, Math.min(100, Math.round(score)));

  return {
    date: startOfNepaliDay(date),
    panchang,
    score,
    verdict: score >= 78 ? 'Excellent' : score >= 62 ? 'Good' : score >= 45 ? 'Workable' : 'Avoid',
    reasons,
    bestWindow,
  };
}

/**
 * The best usable stretch of daylight.
 *
 * The good choghadiya are the candidates; any that collide with rahu kaal or
 * yamaganda are dropped, because a window that overlaps either is not a
 * window anyone will actually use. Amrit outranks Shubh, which outranks Labh.
 */
function pickBestWindow(panchang: Panchang): Window | null {
  const windows = panchang.windows;
  if (!windows) return null;

  const clashes = (w: Window) =>
    [windows.rahuKaal, windows.yamaganda].some(
      (bad) => w.from < bad.to && bad.from < w.to,
    );

  const rank: Record<string, number> = { Amrit: 4, Shubh: 3, Labh: 2, Char: 1 };
  const candidates = windows.choghadiyaDay
    .filter((w) => w.quality === 'good' && !clashes(w))
    .sort((a, b) => (rank[b.name] ?? 0) - (rank[a.name] ?? 0));

  // Abhijit overrides most other faults, so it wins when nothing better is free.
  return candidates[0] ?? windows.abhijit ?? null;
}

/**
 * Find the best days for an activity over a span.
 *
 * Returns every day scored, newest rules first, so a screen can show both the
 * shortlist and the days that were rejected and why.
 */
export function findMuhurta(
  activity: Activity,
  options: {
    from?: Date;
    days?: number;
    chart?: Chart | null;
    place?: Place;
  } = {},
): DayScore[] {
  const { from = new Date(), days = 45, chart = null, place = KATHMANDU } = options;
  const start = startOfNepaliDay(from);

  return Array.from({ length: days }, (_, i) =>
    // Midday keeps the reading inside the day, away from either sunrise edge.
    scoreDay(addDays(new Date(start.getTime() + 12 * 3600_000), i), activity, chart, place),
  );
}

/* ------------------------------------------------------------------ *
 * Shubha lagna
 * ------------------------------------------------------------------ */

export type LagnaWindow = {
  rashi: string;
  np: string;
  from: Date;
  to: Date;
  suitable: boolean;
};

/**
 * When each lagna rises on a given day.
 *
 * A ceremony is fixed to a lagna, not to a clock time — "the sait is in
 * Vrishabha lagna" — so this walks the day in five-minute steps and reports
 * the span each sign holds the horizon. Signs rise unevenly: at Kathmandu's
 * latitude a short-ascension sign can take well under an hour and a long one
 * over two, which is exactly why it has to be computed rather than divided.
 */
export function lagnaWindows(
  date: Date,
  place: Place = KATHMANDU,
  activity?: Activity,
): LagnaWindow[] {
  const start = startOfNepaliDay(date);
  const windows: LagnaWindow[] = [];
  const STEP = 5 * 60_000;

  let currentSign = -1;
  let currentFrom = start;

  for (let t = start.getTime(); t <= start.getTime() + 86400_000; t += STEP) {
    const at = new Date(t);
    const sign = Math.floor(ascendantAt(at, place) / 30) % 12;

    if (sign !== currentSign) {
      if (currentSign >= 0) {
        windows.push({
          rashi: RASHIS[currentSign].vedic,
          np: RASHIS[currentSign].np,
          from: currentFrom,
          to: at,
          suitable: !activity?.lagnas.length || activity.lagnas.includes(currentSign),
        });
      }
      currentSign = sign;
      currentFrom = at;
    }
  }

  if (currentSign >= 0) {
    windows.push({
      rashi: RASHIS[currentSign].vedic,
      np: RASHIS[currentSign].np,
      from: currentFrom,
      to: new Date(start.getTime() + 86400_000),
      suitable: !activity?.lagnas.length || activity.lagnas.includes(currentSign),
    });
  }

  return windows;
}

