/**
 * The birth chart.
 *
 * This turns a birth moment and a place into the thing every other service
 * reads: nine grahas in twelve houses, with their dignity, their aspects and
 * their divisional positions. The ascendant is computed properly here — from
 * local sidereal time, the obliquity of the ecliptic and the latitude of the
 * birth place — rather than estimated from sunrise, because the lagna decides
 * every house placement in the chart and an hour's error rewrites the reading.
 */
import {
  GRAHA_ORDER,
  type GrahaId,
  type GrahaPosition,
  ayanamsa,
  formatDegreesInSign,
  grahaPositions,
  localSiderealDegrees,
  norm360,
  obliquity,
} from './ephemeris';
import type { Place } from './places';
import {
  EXALTATION,
  MOOLATRIKONA,
  NAKSHATRAS,
  OWN_SIGNS,
  RASHIS,
  friendshipBetween,
  nakshatraAt,
  rashiAt,
  type NakshatraMeta,
  type Rashi,
} from './signs';

const DEG = Math.PI / 180;

/* ------------------------------------------------------------------ *
 * Ascendant and midheaven
 * ------------------------------------------------------------------ */

/**
 * The sidereal ascendant, in degrees.
 *
 * The standard spherical formula: given the right ascension of the meridian,
 * the obliquity and the observer's latitude, this is the ecliptic degree
 * crossing the eastern horizon. Accurate to well under a minute of arc, which
 * matters — the lagna moves about half a degree per minute of clock time, so
 * a birth time recorded to the minute deserves an ascendant computed to match.
 */
export function ascendantAt(at: Date, place: Place): number {
  const ramc = localSiderealDegrees(at, place) * DEG;
  const eps = obliquity(at) * DEG;
  const lat = place.latitude * DEG;

  const tropical = norm360(
    Math.atan2(
      Math.cos(ramc),
      -(Math.sin(ramc) * Math.cos(eps) + Math.tan(lat) * Math.sin(eps)),
    ) / DEG,
  );

  return norm360(tropical - ayanamsa(at));
}

/** The sidereal midheaven — the tenth-house degree, for career readings. */
export function midheavenAt(at: Date, place: Place): number {
  const ramc = localSiderealDegrees(at, place) * DEG;
  const eps = obliquity(at) * DEG;
  const tropical = norm360(
    Math.atan2(Math.sin(ramc), Math.cos(ramc) * Math.cos(eps)) / DEG,
  );
  return norm360(tropical - ayanamsa(at));
}

/* ------------------------------------------------------------------ *
 * Dignity
 * ------------------------------------------------------------------ */

export type Dignity =
  | 'Exalted'
  | 'Moolatrikona'
  | 'Own sign'
  | 'Friend’s sign'
  | 'Neutral sign'
  | 'Enemy’s sign'
  | 'Debilitated';

/** How strong a graha is by virtue of the sign it occupies. */
export function dignityOf(graha: GrahaId, longitude: number): Dignity {
  const rashi = Math.floor(norm360(longitude) / 30) % 12;
  const degree = norm360(longitude) % 30;

  const exalt = EXALTATION[graha];
  if (exalt.rashi === rashi) return 'Exalted';
  if ((exalt.rashi + 6) % 12 === rashi) return 'Debilitated';

  const moola = MOOLATRIKONA[graha];
  if (moola && moola.rashi === rashi && degree >= moola.from && degree < moola.to) {
    return 'Moolatrikona';
  }

  if (OWN_SIGNS[graha].includes(rashi)) return 'Own sign';

  const relation = friendshipBetween(graha, RASHIS[rashi].lord);
  if (relation === 'friend') return 'Friend’s sign';
  if (relation === 'enemy') return 'Enemy’s sign';
  return 'Neutral sign';
}

/** A rough 0–100 strength, for sorting and for the bars a screen draws. */
const DIGNITY_SCORE: Record<Dignity, number> = {
  Exalted: 100,
  Moolatrikona: 88,
  'Own sign': 80,
  'Friend’s sign': 62,
  'Neutral sign': 50,
  'Enemy’s sign': 30,
  Debilitated: 12,
};

/* ------------------------------------------------------------------ *
 * Aspects
 * ------------------------------------------------------------------ */

/**
 * Which houses ahead of itself a graha aspects.
 *
 * Vedic aspects are counted in whole signs, not measured in degrees. Every
 * graha sees the seventh from itself; Mars, Jupiter and Saturn have their own
 * additional special aspects, which is most of what makes them read the way
 * they do.
 */
const SPECIAL_ASPECTS: Record<GrahaId, number[]> = {
  sun: [7],
  moon: [7],
  mars: [4, 7, 8],
  mercury: [7],
  jupiter: [5, 7, 9],
  venus: [7],
  saturn: [3, 7, 10],
  rahu: [5, 7, 9],
  ketu: [5, 7, 9],
};

/* ------------------------------------------------------------------ *
 * Divisional charts
 * ------------------------------------------------------------------ */

export type VargaId =
  | 'D1' | 'D2' | 'D3' | 'D4' | 'D7' | 'D9' | 'D10'
  | 'D12' | 'D16' | 'D20' | 'D24' | 'D27' | 'D30' | 'D60';

export const VARGAS: { id: VargaId; name: string; about: string }[] = [
  { id: 'D1', name: 'Rashi (D1)', about: 'The body, the life, everything at first reading' },
  { id: 'D2', name: 'Hora (D2)', about: 'Wealth and what you hold on to' },
  { id: 'D3', name: 'Drekkana (D3)', about: 'Siblings, courage, your own effort' },
  { id: 'D4', name: 'Chaturthamsa (D4)', about: 'Home, land, property' },
  { id: 'D7', name: 'Saptamsa (D7)', about: 'Children and lineage' },
  { id: 'D9', name: 'Navamsa (D9)', about: 'Marriage, dharma, the chart’s real strength' },
  { id: 'D10', name: 'Dasamsa (D10)', about: 'Career, standing, what you are known for' },
  { id: 'D12', name: 'Dwadasamsa (D12)', about: 'Parents and inheritance' },
  { id: 'D16', name: 'Shodasamsa (D16)', about: 'Vehicles, comforts, ease' },
  { id: 'D20', name: 'Vimsamsa (D20)', about: 'Worship and spiritual practice' },
  { id: 'D24', name: 'Siddhamsa (D24)', about: 'Learning and education' },
  { id: 'D27', name: 'Bhamsa (D27)', about: 'Stamina and inner strength' },
  { id: 'D30', name: 'Trimsamsa (D30)', about: 'Misfortune and its shape' },
  { id: 'D60', name: 'Shashtiamsa (D60)', about: 'The finest reading, and past accounts' },
];

/** Sign of a longitude in a divisional chart, 0–11 from Mesha. */
export function vargaSign(varga: VargaId, longitude: number): number {
  const lon = norm360(longitude);
  const rashi = Math.floor(lon / 30) % 12;
  const deg = lon % 30;
  const odd = rashi % 2 === 0;
  const quality = RASHIS[rashi].quality;

  switch (varga) {
    case 'D1':
      return rashi;

    // Sun's hora in the first half of an odd sign, Moon's in the second;
    // the other way round for even signs.
    case 'D2':
      return deg < 15 ? (odd ? 4 : 3) : odd ? 3 : 4;

    // Each third goes to the sign itself, the 5th from it, then the 9th.
    case 'D3':
      return (rashi + [0, 4, 8][Math.floor(deg / 10)]) % 12;

    case 'D4':
      return (rashi + [0, 3, 6, 9][Math.floor(deg / 7.5)]) % 12;

    // Odd signs count from themselves, even signs from the seventh.
    case 'D7':
      return ((odd ? rashi : rashi + 6) + Math.floor(deg / (30 / 7))) % 12;

    // Movable signs start from themselves, fixed from the 9th, dual from the 5th.
    case 'D9': {
      const start = quality === 'Movable' ? rashi : quality === 'Fixed' ? (rashi + 8) % 12 : (rashi + 4) % 12;
      return (start + Math.floor(deg / (30 / 9))) % 12;
    }

    case 'D10':
      return ((odd ? rashi : rashi + 8) + Math.floor(deg / 3)) % 12;

    case 'D12':
      return (rashi + Math.floor(deg / 2.5)) % 12;

    case 'D16': {
      const start = quality === 'Movable' ? 0 : quality === 'Fixed' ? 4 : 8;
      return (start + Math.floor(deg / (30 / 16))) % 12;
    }

    case 'D20': {
      const start = quality === 'Movable' ? 0 : quality === 'Fixed' ? 8 : 4;
      return (start + Math.floor(deg / 1.5)) % 12;
    }

    case 'D24':
      return ((odd ? 4 : 3) + Math.floor(deg / 1.25)) % 12;

    case 'D27': {
      const start = { Fire: 0, Earth: 3, Air: 6, Water: 9 }[RASHIS[rashi].element];
      return (start + Math.floor(deg / (30 / 27))) % 12;
    }

    // Five unequal parts, ruled by the five non-luminaries; reversed in even
    // signs. The luminaries own no trimsamsa at all.
    case 'D30': {
      if (odd) {
        if (deg < 5) return 0;
        if (deg < 10) return 10;
        if (deg < 18) return 8;
        if (deg < 25) return 2;
        return 6;
      }
      if (deg < 5) return 1;
      if (deg < 12) return 5;
      if (deg < 20) return 11;
      if (deg < 25) return 9;
      return 7;
    }

    // Half a degree each, counted from Mesha in odd signs and Tula in even.
    case 'D60': {
      const part = Math.floor(deg * 2) % 12;
      return (part + (odd ? 0 : 6)) % 12;
    }
  }
}

/* ------------------------------------------------------------------ *
 * The chart
 * ------------------------------------------------------------------ */

export type PlacedGraha = GrahaPosition & {
  /** House 1–12, counted from the lagna in whole signs. */
  house: number;
  dignity: Dignity;
  /** 0–100, from dignity alone; combustion and retrogression adjust it. */
  strength: number;
  nakshatraMeta: NakshatraMeta;
  /** "7°27'" within its sign. */
  degreeLabel: string;
  /** Houses this graha throws its drishti on. */
  aspects: number[];
};

export type BirthMoment = {
  /** The instant of birth, as a real point in time. */
  at: Date;
  place: Place;
  /** False when the user could not give a birth time. */
  timeKnown: boolean;
};

export type Chart = {
  moment: BirthMoment;
  /** Sidereal ascendant degree. */
  ascendant: number;
  midheaven: number;
  lagna: Rashi;
  /** Moon sign — what a Nepali means by "my rashi". */
  rashi: Rashi;
  /** Sun sign on the sidereal zodiac, which is not the western one. */
  sunRashi: Rashi;
  /** Janma nakshatra, with its pada. */
  nakshatra: NakshatraMeta;
  pada: number;
  grahas: Record<GrahaId, PlacedGraha>;
  /** Grahas sitting in each house, 1–12. */
  houses: { house: number; rashi: Rashi; grahas: PlacedGraha[] }[];
  /** True when the birth time was unknown and the chart used noon. */
  approximate: boolean;
};

/**
 * Build the chart.
 *
 * Houses are whole-sign — the system Parashara describes and every Nepali
 * astrologer draws — so the lagna's sign is the whole first house, the next
 * sign the whole second, and a graha's house follows from its sign alone.
 */
export function buildChart(moment: BirthMoment): Chart {
  const { at, place, timeKnown } = moment;
  const positions = grahaPositions(at);
  const ascendant = ascendantAt(at, place);
  const lagnaIndex = Math.floor(ascendant / 30) % 12;

  const grahas = {} as Record<GrahaId, PlacedGraha>;
  for (const id of GRAHA_ORDER) {
    const position = positions[id];
    const house = ((position.rashi - lagnaIndex + 12) % 12) + 1;
    const dignity = dignityOf(id, position.longitude);

    // Dignity sets the base; a combust graha cannot act, and a retrograde one
    // is traditionally read as stronger but harder to use.
    let strength = DIGNITY_SCORE[dignity];
    if (position.combust) strength = Math.round(strength * 0.6);
    else if (position.retrograde && !position.graha.shadow) {
      strength = Math.min(100, Math.round(strength * 1.1));
    }

    grahas[id] = {
      ...position,
      house,
      dignity,
      strength,
      nakshatraMeta: NAKSHATRAS[position.nakshatra],
      degreeLabel: formatDegreesInSign(position.longitude),
      aspects: SPECIAL_ASPECTS[id].map((offset) => ((house - 1 + offset - 1) % 12) + 1),
    };
  }

  const houses = Array.from({ length: 12 }, (_, i) => {
    const house = i + 1;
    return {
      house,
      rashi: RASHIS[(lagnaIndex + i) % 12],
      grahas: GRAHA_ORDER.map((id) => grahas[id]).filter((g) => g.house === house),
    };
  });

  const moonNakshatra = nakshatraAt(positions.moon.longitude);

  return {
    moment,
    ascendant,
    midheaven: midheavenAt(at, place),
    lagna: RASHIS[lagnaIndex],
    rashi: rashiAt(positions.moon.longitude),
    sunRashi: rashiAt(positions.sun.longitude),
    nakshatra: moonNakshatra.meta,
    pada: moonNakshatra.pada,
    grahas,
    houses,
    approximate: !timeKnown,
  };
}

/** The same chart's placements in a divisional chart. */
export function vargaChart(
  chart: Chart,
  varga: VargaId,
): { lagna: number; grahas: { id: GrahaId; sign: number }[] } {
  return {
    lagna: vargaSign(varga, chart.ascendant),
    grahas: GRAHA_ORDER.map((id) => ({
      id,
      sign: vargaSign(varga, chart.grahas[id].longitude),
    })),
  };
}

/** What each house stands for — the bhava significations, in plain words. */
export const HOUSE_MEANINGS: { house: number; name: string; about: string }[] = [
  { house: 1, name: 'Tanu', about: 'Body, health, how you come across' },
  { house: 2, name: 'Dhana', about: 'Money saved, family, speech' },
  { house: 3, name: 'Sahaja', about: 'Siblings, courage, short journeys' },
  { house: 4, name: 'Sukha', about: 'Mother, home, land, peace of mind' },
  { house: 5, name: 'Putra', about: 'Children, learning, what you create' },
  { house: 6, name: 'Ripu', about: 'Illness, debt, enemies, daily work' },
  { house: 7, name: 'Yuvati', about: 'Marriage, partnership, business with others' },
  { house: 8, name: 'Randhra', about: 'Longevity, upheaval, inheritance, the hidden' },
  { house: 9, name: 'Dharma', about: 'Fortune, father, faith, long journeys' },
  { house: 10, name: 'Karma', about: 'Career, standing, what you do in the world' },
  { house: 11, name: 'Labha', about: 'Gains, income, elder siblings, networks' },
  { house: 12, name: 'Vyaya', about: 'Loss, expense, foreign lands, release' },
];
