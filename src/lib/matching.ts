/**
 * Ashtakoota Guna Milan — the 36-point compatibility method.
 *
 * The eight kootas are computed from the two moon positions, which come from
 * `panchang.ts`, so the same pair of birth dates always gives the same score
 * and the arithmetic is the published one rather than a number picked to look
 * plausible. Two tables are simplified, and say so where they are defined:
 * Vashya ignores the half-sign splits in Dhanu and Makara, and Yoni scores
 * enmity as a sworn-enemy list rather than the full 14 × 14 matrix.
 */
import { nakshatraAt, siderealLongitudes } from './panchang';
import { RASHIS, rashiAt, type Rashi } from './kundli';

export type BirthInput = {
  name: string;
  date: { day: number; month: number; year: number };
};

export type Koota = {
  id: string;
  label: string;
  /** What this koota is held to measure, in one line. */
  about: string;
  score: number;
  max: number;
};

export type MatchResult = {
  total: number;
  max: number;
  verdict: string;
  summary: string;
  kootas: Koota[];
  /** The moon position each chart was read from. */
  people: { name: string; rashi: Rashi; nakshatra: string }[];
};

/* ------------------------------------------------------------------ *
 * Tables
 * ------------------------------------------------------------------ */

/** Nakshatra → yoni animal, and its gender. */
const YONI: { animal: string; male: boolean }[] = [
  { animal: 'Horse', male: true },
  { animal: 'Elephant', male: true },
  { animal: 'Sheep', male: false },
  { animal: 'Serpent', male: true },
  { animal: 'Serpent', male: false },
  { animal: 'Dog', male: false },
  { animal: 'Cat', male: false },
  { animal: 'Sheep', male: true },
  { animal: 'Cat', male: true },
  { animal: 'Rat', male: true },
  { animal: 'Rat', male: false },
  { animal: 'Cow', male: true },
  { animal: 'Buffalo', male: false },
  { animal: 'Tiger', male: false },
  { animal: 'Buffalo', male: true },
  { animal: 'Tiger', male: true },
  { animal: 'Deer', male: false },
  { animal: 'Deer', male: true },
  { animal: 'Dog', male: true },
  { animal: 'Monkey', male: true },
  { animal: 'Mongoose', male: false },
  { animal: 'Monkey', male: false },
  { animal: 'Lion', male: false },
  { animal: 'Horse', male: false },
  { animal: 'Lion', male: true },
  { animal: 'Cow', male: false },
  { animal: 'Elephant', male: false },
];

/** The pairs traditionally held to be at war; everything else is neutral. */
const SWORN_ENEMIES = [
  ['Cow', 'Tiger'],
  ['Elephant', 'Lion'],
  ['Horse', 'Buffalo'],
  ['Dog', 'Deer'],
  ['Serpent', 'Mongoose'],
  ['Monkey', 'Sheep'],
  ['Cat', 'Rat'],
];

/** Nakshatra → gana. */
const GANA: ('Deva' | 'Manushya' | 'Rakshasa')[] = [
  'Deva', 'Manushya', 'Rakshasa', 'Manushya', 'Deva', 'Manushya',
  'Deva', 'Deva', 'Rakshasa', 'Rakshasa', 'Manushya', 'Manushya',
  'Deva', 'Rakshasa', 'Deva', 'Rakshasa', 'Deva', 'Rakshasa',
  'Rakshasa', 'Manushya', 'Manushya', 'Deva', 'Rakshasa', 'Rakshasa',
  'Manushya', 'Manushya', 'Deva',
];

/** Nakshatra → nadi. Sharing one is the single heaviest objection. */
const NADI: ('Adi' | 'Madhya' | 'Antya')[] = [
  'Adi', 'Madhya', 'Antya', 'Antya', 'Madhya', 'Adi',
  'Adi', 'Madhya', 'Antya', 'Antya', 'Madhya', 'Adi',
  'Adi', 'Madhya', 'Antya', 'Antya', 'Madhya', 'Adi',
  'Adi', 'Madhya', 'Antya', 'Antya', 'Madhya', 'Adi',
  'Adi', 'Madhya', 'Antya',
];

/** Rashi → varna, ranked so the comparison is a number. */
const VARNA_RANK: Record<number, number> = {
  3: 4, 7: 4, 11: 4, // Brahmin — the water signs
  0: 3, 4: 3, 8: 3, // Kshatriya — fire
  1: 2, 5: 2, 9: 2, // Vaishya — earth
  2: 1, 6: 1, 10: 1, // Shudra — air
};

/**
 * Rashi → vashya group.
 *
 * Simplified: Dhanu and Makara are split across two groups in the full
 * method, and each is taken here as its first half.
 */
const VASHYA: ('Quadruped' | 'Human' | 'Water' | 'Insect' | 'Wild')[] = [
  'Quadruped', 'Quadruped', 'Human', 'Water', 'Wild', 'Human',
  'Human', 'Insect', 'Human', 'Water', 'Human', 'Water',
];

/** Planetary friendship, as the graha maitri koota reads it. */
const FRIENDS: Record<string, string[]> = {
  Sun: ['Moon', 'Mars', 'Jupiter'],
  Moon: ['Sun', 'Mercury'],
  Mars: ['Sun', 'Moon', 'Jupiter'],
  Mercury: ['Sun', 'Venus'],
  Jupiter: ['Sun', 'Moon', 'Mars'],
  Venus: ['Mercury', 'Saturn'],
  Saturn: ['Mercury', 'Venus'],
};

const ENEMIES: Record<string, string[]> = {
  Sun: ['Venus', 'Saturn'],
  Moon: [],
  Mars: ['Mercury'],
  Mercury: ['Moon'],
  Jupiter: ['Mercury', 'Venus'],
  Venus: ['Sun', 'Moon'],
  Saturn: ['Sun', 'Moon', 'Mars'],
};

/* ------------------------------------------------------------------ *
 * The eight kootas
 * ------------------------------------------------------------------ */

function varnaScore(groom: Rashi, bride: Rashi): number {
  return VARNA_RANK[groom.index] >= VARNA_RANK[bride.index] ? 1 : 0;
}

function vashyaScore(groom: Rashi, bride: Rashi): number {
  const a = VASHYA[groom.index];
  const b = VASHYA[bride.index];
  if (a === b) return 2;
  // A wild sign and anything it would hunt, or be hunted by, scores nothing.
  if (a === 'Wild' || b === 'Wild') return 0;
  return 1;
}

/** Counting from one nakshatra to the other, 3rd, 5th and 7th are the hard ones. */
function taraScore(groomIndex: number, brideIndex: number): number {
  const half = (from: number, to: number) => {
    const count = ((to - from + 27) % 27) + 1;
    const remainder = count % 9;
    return [3, 5, 7].includes(remainder) ? 0 : 1.5;
  };
  return half(brideIndex, groomIndex) + half(groomIndex, brideIndex);
}

function yoniScore(groomIndex: number, brideIndex: number): number {
  const a = YONI[groomIndex];
  const b = YONI[brideIndex];

  if (a.animal === b.animal) return a.male === b.male ? 3 : 4;

  const atWar = SWORN_ENEMIES.some(
    ([x, y]) =>
      (a.animal === x && b.animal === y) || (a.animal === y && b.animal === x),
  );
  return atWar ? 0 : 2;
}

function maitriScore(groom: Rashi, bride: Rashi): number {
  const a = groom.lord;
  const b = bride.lord;
  if (a === b) return 5;

  const rank = (from: string, to: string) => {
    if (FRIENDS[from]?.includes(to)) return 'friend';
    if (ENEMIES[from]?.includes(to)) return 'enemy';
    return 'neutral';
  };

  const pair = [rank(a, b), rank(b, a)].sort().join('-');
  switch (pair) {
    case 'friend-friend':
      return 5;
    case 'friend-neutral':
      return 4;
    case 'neutral-neutral':
      return 3;
    case 'enemy-friend':
      return 1;
    case 'enemy-neutral':
      return 0.5;
    default:
      return 0;
  }
}

function ganaScore(groomIndex: number, brideIndex: number): number {
  const a = GANA[groomIndex];
  const b = GANA[brideIndex];
  if (a === b) return 6;
  if (a === 'Deva' && b === 'Manushya') return 6;
  if (a === 'Manushya' && b === 'Deva') return 5;
  if (a === 'Deva' && b === 'Rakshasa') return 1;
  return 0;
}

/** The 6/8, 5/9 and 2/12 sign distances are the ones Bhakoot rejects. */
function bhakootScore(groom: Rashi, bride: Rashi): number {
  const forward = ((bride.index - groom.index + 12) % 12) + 1;
  const back = ((groom.index - bride.index + 12) % 12) + 1;
  const pair = [forward, back].sort((x, y) => x - y).join('-');
  return ['2-12', '5-9', '6-8'].includes(pair) ? 0 : 7;
}

function nadiScore(groomIndex: number, brideIndex: number): number {
  return NADI[groomIndex] === NADI[brideIndex] ? 0 : 8;
}

/* ------------------------------------------------------------------ *
 * The match
 * ------------------------------------------------------------------ */

/** The moon's rashi and nakshatra for a birth date, read at local noon. */
function moonAt(date: BirthInput['date']) {
  // Noon keeps the moon within half a day of wherever it truly was, which is
  // the best that can be done without a birth time.
  const at = new Date(Date.UTC(date.year, date.month - 1, date.day, 12) - 345 * 60000);
  const { moon } = siderealLongitudes(at);
  return { rashi: rashiAt(moon), nakshatra: nakshatraAt(moon) };
}

function verdictFor(total: number): { verdict: string; summary: string } {
  if (total >= 32) {
    return {
      verdict: 'Excellent',
      summary:
        'A very strong match on the traditional count. An astrologer would normally look only at the timing of the wedding from here.',
    };
  }
  if (total >= 25) {
    return {
      verdict: 'Good',
      summary:
        'A good match. Any koota that scored zero is worth reading through with an astrologer, but the count itself is comfortable.',
    };
  }
  if (total >= 18) {
    return {
      verdict: 'Acceptable',
      summary:
        'Acceptable by the usual threshold of 18. Which kootas fell short matters more than the total — take the zeros to an astrologer.',
    };
  }
  return {
    verdict: 'Needs discussion',
    summary:
      'Below the usual threshold of 18. This is where a full chart reading matters: Guna Milan is one of several tests, not the final word.',
  };
}

/**
 * Match two birth dates.
 *
 * `groom` and `bride` are the names the method itself uses; several kootas
 * are asymmetric, so which chart is which changes the score.
 */
export function matchCharts(groom: BirthInput, bride: BirthInput): MatchResult {
  const a = moonAt(groom.date);
  const b = moonAt(bride.date);

  const kootas: Koota[] = [
    {
      id: 'varna',
      label: 'Varna',
      about: 'Temperament and the work each of you is drawn to',
      score: varnaScore(a.rashi, b.rashi),
      max: 1,
    },
    {
      id: 'vashya',
      label: 'Vashya',
      about: 'Who gives way to whom, and how easily',
      score: vashyaScore(a.rashi, b.rashi),
      max: 2,
    },
    {
      id: 'tara',
      label: 'Tara',
      about: 'Health and fortune once you are together',
      score: taraScore(a.nakshatra.index, b.nakshatra.index),
      max: 3,
    },
    {
      id: 'yoni',
      label: 'Yoni',
      about: 'Physical and instinctive compatibility',
      score: yoniScore(a.nakshatra.index, b.nakshatra.index),
      max: 4,
    },
    {
      id: 'maitri',
      label: 'Graha Maitri',
      about: 'Friendship between the two ruling planets — mental affinity',
      score: maitriScore(a.rashi, b.rashi),
      max: 5,
    },
    {
      id: 'gana',
      label: 'Gana',
      about: 'Disposition: how each of you behaves under stress',
      score: ganaScore(a.nakshatra.index, b.nakshatra.index),
      max: 6,
    },
    {
      id: 'bhakoot',
      label: 'Bhakoot',
      about: 'The distance between your moon signs — household and prosperity',
      score: bhakootScore(a.rashi, b.rashi),
      max: 7,
    },
    {
      id: 'nadi',
      label: 'Nadi',
      about: 'Constitution and lineage — the heaviest single koota',
      score: nadiScore(a.nakshatra.index, b.nakshatra.index),
      max: 8,
    },
  ];

  const total = kootas.reduce((sum, koota) => sum + koota.score, 0);
  const { verdict, summary } = verdictFor(total);

  return {
    total,
    max: 36,
    verdict,
    summary,
    kootas,
    people: [
      { name: groom.name, rashi: a.rashi, nakshatra: a.nakshatra.name },
      { name: bride.name, rashi: b.rashi, nakshatra: b.nakshatra.name },
    ],
  };
}
