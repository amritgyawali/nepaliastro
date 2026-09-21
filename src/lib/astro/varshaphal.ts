/**
 * Varshaphal — the year ahead, from the solar return.
 *
 * The Tajik system asks a narrower question than the birth chart: not what a
 * life holds, but what this one year holds. The year begins at the instant
 * the sun comes back to the exact degree it held at birth — which is rarely
 * the birthday, and can be a day either side of it — and a fresh chart is
 * cast for that moment.
 */
import { GRAHAS, siderealLongitude, type GrahaId } from './ephemeris';
import { RASHIS } from './signs';
import { buildChart, type Chart } from './chart';
import type { Place } from './places';
import { HOUSE_MEANINGS } from './chart';

/**
 * The instant the sun returns to its birth longitude.
 *
 * Searched by bisection around the birthday: the sun moves just under a
 * degree a day, so the return can fall up to about a day either side of the
 * anniversary, and taking the birthday itself would put the chart's lagna
 * out by fifteen degrees or more.
 */
export function solarReturn(chart: Chart, year: number): Date {
  const natalSun = siderealLongitude('sun', chart.moment.at);
  const birth = chart.moment.at;

  // Start from the anniversary and search the two days around it.
  const anniversary = new Date(birth.getTime());
  anniversary.setUTCFullYear(year);

  const offset = (at: Date) => {
    const diff = siderealLongitude('sun', at) - natalSun;
    return ((diff + 540) % 360) - 180;
  };

  let low = anniversary.getTime() - 3 * 86400_000;
  let high = anniversary.getTime() + 3 * 86400_000;

  for (let i = 0; i < 60 && high - low > 60_000; i += 1) {
    const mid = (low + high) / 2;
    if (offset(new Date(mid)) < 0) low = mid;
    else high = mid;
  }

  return new Date(high);
}

export type Varshaphal = {
  year: number;
  /** The instant the solar year begins. */
  beginsAt: Date;
  /** The chart cast for that instant, at the person's current place. */
  chart: Chart;
  /** Muntha — the sensitive point, advancing one sign a year from the lagna. */
  muntha: { rashi: string; house: number; lord: GrahaId; about: string };
  /** Varshesh — the graha that carries the year. */
  yearLord: { graha: GrahaId; name: string; reason: string };
  /** The age this year completes. */
  age: number;
  highlights: string[];
};

/**
 * The year's chart.
 *
 * `place` is where the person lives now, not where they were born — the
 * varsha lagna is read for where the year will actually be lived, which is
 * the Tajik convention and matters for anyone who has moved abroad.
 */
export function varshaphalFor(chart: Chart, year: number, place: Place): Varshaphal {
  const beginsAt = solarReturn(chart, year);
  const yearChart = buildChart({ at: beginsAt, place, timeKnown: true });

  const birthYear = new Date(
    chart.moment.at.getTime() + 345 * 60_000,
  ).getUTCFullYear();
  const age = year - birthYear;

  // Muntha starts on the birth lagna and advances one sign for each completed
  // year, so it returns to the lagna every twelve years.
  const munthaSign = (chart.lagna.index + age) % 12;
  const munthaHouse = ((munthaSign - yearChart.lagna.index + 12) % 12) + 1;
  const munthaLord = RASHIS[munthaSign].lord;

  // The year lord, chosen from the classical candidates by chart strength.
  const candidates: { graha: GrahaId; reason: string }[] = [
    { graha: munthaLord, reason: 'lord of the muntha' },
    { graha: yearChart.lagna.lord, reason: 'lord of the year’s ascendant' },
    { graha: chart.lagna.lord, reason: 'lord of the birth ascendant' },
    { graha: yearChart.rashi.lord, reason: 'lord of the year’s moon sign' },
  ];
  const yearLord = candidates
    .map((c) => ({ ...c, strength: yearChart.grahas[c.graha].strength }))
    .sort((a, b) => b.strength - a.strength)[0];

  const highlights: string[] = [];
  const lordPosition = yearChart.grahas[yearLord.graha];
  highlights.push(
    `${GRAHAS[yearLord.graha].vedic} carries the year from the ${lordPosition.house}th house — ${HOUSE_MEANINGS[lordPosition.house - 1].about.toLowerCase()}.`,
  );
  highlights.push(
    `Muntha sits in the ${munthaHouse}th, so ${HOUSE_MEANINGS[munthaHouse - 1].about.toLowerCase()} is where the year concentrates.`,
  );
  if ([6, 8, 12].includes(munthaHouse)) {
    highlights.push('A muntha in a difficult house asks for a quieter year — consolidate rather than expand.');
  } else if ([1, 5, 9, 10, 11].includes(munthaHouse)) {
    highlights.push('A well-placed muntha — this is a year to begin things rather than defend them.');
  }

  return {
    year,
    beginsAt,
    chart: yearChart,
    muntha: {
      rashi: RASHIS[munthaSign].vedic,
      house: munthaHouse,
      lord: munthaLord,
      about: HOUSE_MEANINGS[munthaHouse - 1].about,
    },
    yearLord: { graha: yearLord.graha, name: GRAHAS[yearLord.graha].vedic, reason: yearLord.reason },
    age,
    highlights,
  };
}
