/**
 * Gochar — where the grahas are now, and what that means for a chart.
 *
 * A transit only means something in relation to something else. Saturn in
 * Meena is a fact; Saturn in the twelfth from your moon is a reading. So
 * everything here is counted from a reference sign — the person's moon sign,
 * which is what Vedic astrology uses for transits — and the same machinery
 * serves both a personal reading and the twelve-sign rashifal.
 */
import { GRAHAS, GRAHA_ORDER, grahaPositions, siderealLongitude, type GrahaId } from './ephemeris';
import { RASHIS, nakshatraAt } from './signs';
import type { Chart } from './chart';
import { HOUSE_MEANINGS } from './chart';

/**
 * How each graha behaves in each house counted from the moon.
 *
 * These are the classical gochar results — the houses a graha is said to
 * favour, and the ones where it obstructs. Read from the moon, not the lagna,
 * which is what separates a transit reading from a birth reading.
 */
const FAVOURABLE_HOUSES: Record<GrahaId, number[]> = {
  sun: [3, 6, 10, 11],
  moon: [1, 3, 6, 7, 10, 11],
  mars: [3, 6, 11],
  mercury: [2, 4, 6, 8, 10, 11],
  jupiter: [2, 5, 7, 9, 11],
  venus: [1, 2, 3, 4, 5, 8, 9, 11, 12],
  saturn: [3, 6, 11],
  rahu: [3, 6, 10, 11],
  ketu: [3, 6, 11],
};

export type TransitReading = {
  graha: GrahaId;
  name: string;
  np: string;
  /** Sign the graha stands in now. */
  rashi: string;
  /** House counted from the reference sign. */
  house: number;
  favourable: boolean;
  retrograde: boolean;
  /** What this transit is doing, in one sentence. */
  note: string;
};

const THEMES: Record<GrahaId, string> = {
  sun: 'standing, health and dealings with authority',
  moon: 'mood, sleep and what the day feels like',
  mars: 'energy, arguments and physical effort',
  mercury: 'talk, paperwork, travel and trade',
  jupiter: 'growth, money, teachers and good advice',
  venus: 'comfort, relationships and what you spend on',
  saturn: 'work, delay, duty and what will not be rushed',
  rahu: 'ambition, foreign things and sudden turns',
  ketu: 'detachment, loss of interest and what quietly ends',
};

/** Every graha's current transit, counted from a reference sign. */
export function transitsFrom(referenceRashi: number, at: Date = new Date()): TransitReading[] {
  const positions = grahaPositions(at);

  return GRAHA_ORDER.map((id) => {
    const position = positions[id];
    const house = ((position.rashi - referenceRashi + 12) % 12) + 1;
    const favourable = FAVOURABLE_HOUSES[id].includes(house);
    const meaning = HOUSE_MEANINGS[house - 1];

    return {
      graha: id,
      name: GRAHAS[id].vedic,
      np: GRAHAS[id].np,
      rashi: RASHIS[position.rashi].vedic,
      house,
      favourable,
      retrograde: position.retrograde,
      note: favourable
        ? `${GRAHAS[id].vedic} is well placed in the ${house}th — ${THEMES[id]} move easily, through ${meaning.about.toLowerCase()}.`
        : `${GRAHAS[id].vedic} in the ${house}th asks for patience with ${THEMES[id]} — ${meaning.about.toLowerCase()} is where the friction shows.`,
    };
  });
}

/** The same reading for a person, counted from their own moon sign. */
export function transitsFor(chart: Chart, at: Date = new Date()): TransitReading[] {
  return transitsFrom(chart.rashi.index, at);
}

export type GocharSummary = {
  /** -100 to 100. */
  balance: number;
  favourable: TransitReading[];
  challenging: TransitReading[];
  /** The slow grahas — the ones that set the year's tone. */
  slowMovers: TransitReading[];
};

/**
 * The overall weather from the transits.
 *
 * The slow grahas are weighted far above the fast ones: the moon changes sign
 * every two and a half days and decides the mood of an afternoon, while
 * Saturn holds a sign for two and a half years and decides the shape of a
 * period of life. A summary that weighted them equally would say nothing.
 */
const WEIGHTS: Record<GrahaId, number> = {
  moon: 1, mercury: 2, venus: 2, sun: 3, mars: 4, rahu: 6, ketu: 6, jupiter: 9, saturn: 10,
};

export function gocharSummary(readings: TransitReading[]): GocharSummary {
  const total = Object.values(WEIGHTS).reduce((a, b) => a + b, 0);
  const score = readings.reduce(
    (sum, r) => sum + (r.favourable ? WEIGHTS[r.graha] : -WEIGHTS[r.graha]),
    0,
  );

  return {
    balance: Math.round((score / total) * 100),
    favourable: readings.filter((r) => r.favourable),
    challenging: readings.filter((r) => !r.favourable),
    slowMovers: readings.filter((r) => ['jupiter', 'saturn', 'rahu', 'ketu'].includes(r.graha)),
  };
}

/** When a graha next changes sign — the dates people actually plan around. */
export function nextSignChange(graha: GrahaId, from: Date = new Date()): Date | null {
  const current = Math.floor(siderealLongitude(graha, from) / 30) % 12;

  // Saturn needs two and a half years, the moon two and a half days; a
  // four-year horizon covers every graha but the nodes' full circuit.
  const limit = from.getTime() + 4 * 365.25 * 86400_000;
  const step = 12 * 3600_000;

  let previous = from.getTime();
  for (let t = from.getTime(); t < limit; t += step) {
    const sign = Math.floor(siderealLongitude(graha, new Date(t)) / 30) % 12;
    if (sign !== current) {
      // Narrow the half-day step down to the minute.
      let low = previous;
      let high = t;
      for (let i = 0; i < 40 && high - low > 60_000; i += 1) {
        const mid = (low + high) / 2;
        if (Math.floor(siderealLongitude(graha, new Date(mid)) / 30) % 12 === current) low = mid;
        else high = mid;
      }
      return new Date(high);
    }
    previous = t;
  }
  return null;
}

/** The moon's sign right now — what the daily rashifal turns on. */
export function moonRashiNow(at: Date = new Date()): number {
  return Math.floor(siderealLongitude('moon', at) / 30) % 12;
}

/** The nakshatra the moon is crossing, for the day's flavour. */
export function moonNakshatraNow(at: Date = new Date()) {
  return nakshatraAt(siderealLongitude('moon', at));
}
