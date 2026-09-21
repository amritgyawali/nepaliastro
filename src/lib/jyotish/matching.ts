/**
 * Kundali milan — the eight koots, worth thirty-six gunas.
 *
 * This is the reading families actually pay for, and the one where a wrong
 * table does real harm: a match wrongly called "chino jurena" can end an
 * engagement. So each koot is computed from the classical rule and every
 * component is returned with its own score and reason, rather than reduced to
 * a single number. A low total is a prompt to look closer, not a verdict —
 * the report says so, and says which koot pulled it down.
 */
import { GRAHAS } from './ephemeris';
import { friendshipBetween, type Gana, type Vashya } from './signs';
import type { Chart } from './chart';
import { mangalDosha } from './dosha';

export type Koot = {
  id: string;
  name: string;
  np: string;
  score: number;
  max: number;
  /** What this koot is actually testing. */
  about: string;
  /** What was found for this couple. */
  finding: string;
  /** Present and uncancelled — the ones worth flagging. */
  dosha: boolean;
  cancellation: string | null;
};

/* ------------------------------------------------------------------ *
 * 1. Varna — 1 guna
 * ------------------------------------------------------------------ */

const VARNA_RANK: Record<string, number> = {
  Shudra: 1, Vaishya: 2, Kshatriya: 3, Brahmin: 4,
};

function varnaKoot(groom: Chart, bride: Chart): Koot {
  const g = groom.rashi.varna;
  const b = bride.rashi.varna;
  // The rule asks only that the groom's varna is not below the bride's.
  const score = VARNA_RANK[g] >= VARNA_RANK[b] ? 1 : 0;

  return {
    id: 'varna', name: 'Varna', np: 'वर्ण', score, max: 1,
    about: 'Temperament and the work each is suited to',
    finding: `Groom is ${g}, bride is ${b}.` + (score ? '' : ' The bride’s varna stands higher, which this koot marks down.'),
    dosha: false, cancellation: null,
  };
}

/* ------------------------------------------------------------------ *
 * 2. Vashya — 2 gunas
 * ------------------------------------------------------------------ */

const VASHYA_ORDER: Vashya[] = ['Chatushpada', 'Manava', 'Jalachara', 'Vanachara', 'Keeta'];

/** The classical vashya table. Matching groups score full; wild signs least. */
const VASHYA_TABLE: number[][] = [
  /* Chatushpada */ [2, 1, 2, 0.5, 2],
  /* Manava      */ [1, 2, 0.5, 0, 1],
  /* Jalachara   */ [2, 0.5, 2, 0.5, 2],
  /* Vanachara   */ [0.5, 0, 0.5, 2, 0.5],
  /* Keeta       */ [2, 1, 2, 0.5, 2],
];

function vashyaKoot(groom: Chart, bride: Chart): Koot {
  const g = VASHYA_ORDER.indexOf(groom.rashi.vashya);
  const b = VASHYA_ORDER.indexOf(bride.rashi.vashya);
  const score = VASHYA_TABLE[g][b];

  return {
    id: 'vashya', name: 'Vashya', np: 'वश्य', score, max: 2,
    about: 'Who holds sway, and whether it is willingly given',
    finding: `Groom’s sign is ${groom.rashi.vashya}, bride’s is ${bride.rashi.vashya}.`,
    dosha: false, cancellation: null,
  };
}

/* ------------------------------------------------------------------ *
 * 3. Tara — 3 gunas
 * ------------------------------------------------------------------ */

/** The 3rd, 5th and 7th taras from a birth star are the unlucky ones. */
const BAD_TARAS = new Set([3, 5, 7]);

function taraKoot(groom: Chart, bride: Chart): Koot {
  // Count the stars between, then reduce to a tara of 1..9 — a remainder of
  // zero is the ninth tara, not a zeroth one.
  const count = (from: number, to: number) => {
    const steps = ((to - from + 27) % 27) + 1;
    return steps % 9 === 0 ? 9 : steps % 9;
  };
  const forward = count(bride.nakshatra.index, groom.nakshatra.index);
  const backward = count(groom.nakshatra.index, bride.nakshatra.index);

  const forwardGood = !BAD_TARAS.has(forward);
  const backwardGood = !BAD_TARAS.has(backward);
  const score = forwardGood && backwardGood ? 3 : forwardGood || backwardGood ? 1.5 : 0;

  return {
    id: 'tara', name: 'Tara', np: 'तारा', score, max: 3,
    about: 'Health, fortune and how each fares in the other’s company',
    finding: `Counting between ${bride.nakshatra.name} and ${groom.nakshatra.name} gives tara ${forward} and ${backward}.`,
    dosha: score === 0, cancellation: null,
  };
}

/* ------------------------------------------------------------------ *
 * 4. Yoni — 4 gunas
 * ------------------------------------------------------------------ */

/**
 * The seven pairs of sworn enemies among the yoni animals.
 *
 * These score nothing at all; the remaining combinations are graded by
 * temperament — two gentle animals or two predators understand each other,
 * a predator and its prey do not. The sworn pairs and the identical-yoni
 * rule are the parts of this koot that are fixed in the classics.
 */
const SWORN_ENEMIES: [string, string][] = [
  ['Cow', 'Tiger'],
  ['Elephant', 'Lion'],
  ['Horse', 'Buffalo'],
  ['Dog', 'Deer'],
  ['Serpent', 'Mongoose'],
  ['Monkey', 'Sheep'],
  ['Cat', 'Rat'],
];

const PREDATORS = new Set(['Tiger', 'Lion', 'Serpent', 'Cat', 'Dog', 'Mongoose']);

function yoniScore(a: string, b: string): number {
  if (a === b) return 4;
  if (SWORN_ENEMIES.some(([x, y]) => (x === a && y === b) || (x === b && y === a))) return 0;
  const bothPredators = PREDATORS.has(a) && PREDATORS.has(b);
  const bothGentle = !PREDATORS.has(a) && !PREDATORS.has(b);
  if (bothPredators || bothGentle) return 3;
  return 1;
}

function yoniKoot(groom: Chart, bride: Chart): Koot {
  const g = groom.nakshatra;
  const b = bride.nakshatra;
  const score = yoniScore(g.yoni, b.yoni);

  return {
    id: 'yoni', name: 'Yoni', np: 'योनि', score, max: 4,
    about: 'Physical compatibility and instinctive ease with each other',
    finding: `Groom’s yoni is ${g.yoni} (${g.yoniGender}), bride’s is ${b.yoni} (${b.yoniGender}).` +
      (score === 0 ? ' These two are classed as natural enemies.' : ''),
    dosha: score === 0, cancellation: null,
  };
}

/* ------------------------------------------------------------------ *
 * 5. Graha Maitri — 5 gunas
 * ------------------------------------------------------------------ */

function grahaMaitriKoot(groom: Chart, bride: Chart): Koot {
  const g = groom.rashi.lord;
  const b = bride.rashi.lord;

  let score: number;
  if (g === b) score = 5;
  else {
    const forward = friendshipBetween(g, b);
    const backward = friendshipBetween(b, g);
    const pair = [forward, backward].sort().join('-');
    score =
      forward === 'friend' && backward === 'friend' ? 5
        : pair === 'friend-neutral' ? 4
          : forward === 'neutral' && backward === 'neutral' ? 3
            : pair === 'enemy-friend' ? 1
              : pair === 'enemy-neutral' ? 0.5
                : 0;
  }

  return {
    id: 'maitri', name: 'Graha Maitri', np: 'ग्रह मैत्री', score, max: 5,
    about: 'Mental affinity — whether their minds actually meet',
    finding: `${GRAHAS[g].vedic} rules the groom’s moon sign and ${GRAHAS[b].vedic} the bride’s.`,
    dosha: score <= 1, cancellation: null,
  };
}

/* ------------------------------------------------------------------ *
 * 6. Gana — 6 gunas
 * ------------------------------------------------------------------ */

const GANA_ORDER: Gana[] = ['Deva', 'Manushya', 'Rakshasa'];

/** Rows are the groom's gana, columns the bride's. */
const GANA_TABLE: number[][] = [
  /* Deva     */ [6, 6, 0],
  /* Manushya */ [5, 6, 0],
  /* Rakshasa */ [1, 0, 6],
];

function ganaKoot(groom: Chart, bride: Chart): Koot {
  const g = GANA_ORDER.indexOf(groom.nakshatra.gana);
  const b = GANA_ORDER.indexOf(bride.nakshatra.gana);
  const score = GANA_TABLE[g][b];

  // A shared lord or a shared sign is held to settle the temperaments even
  // when the ganas themselves clash.
  const sameLord = groom.rashi.lord === bride.rashi.lord;
  const cancellation =
    score < 6 && sameLord
      ? 'Both moon signs share a lord, which the classics treat as settling a gana clash'
      : null;

  return {
    id: 'gana', name: 'Gana', np: 'गण', score, max: 6,
    about: 'Nature — whether they are made of the same stuff',
    finding: `Groom is ${groom.nakshatra.gana} gana, bride is ${bride.nakshatra.gana}.`,
    dosha: score <= 1 && !cancellation,
    cancellation,
  };
}

/* ------------------------------------------------------------------ *
 * 7. Bhakoot — 7 gunas
 * ------------------------------------------------------------------ */

function bhakootKoot(groom: Chart, bride: Chart): Koot {
  const g = groom.rashi.index;
  const b = bride.rashi.index;
  const forward = ((g - b + 12) % 12) + 1;
  const backward = ((b - g + 12) % 12) + 1;
  const pair = [forward, backward].sort((x, y) => x - y).join('/');

  // 2/12, 5/9 and 6/8 are the three afflicted spacings.
  const afflicted = ['2/12', '5/9', '6/8'].includes(pair);
  const score = afflicted ? 0 : 7;

  const sameLord = groom.rashi.lord === bride.rashi.lord;
  const friendlyLords =
    friendshipBetween(groom.rashi.lord, bride.rashi.lord) === 'friend' &&
    friendshipBetween(bride.rashi.lord, groom.rashi.lord) === 'friend';
  const sameNakshatraLord = groom.nakshatra.lord === bride.nakshatra.lord;

  const cancellation = !afflicted
    ? null
    : sameLord
      ? 'Both moon signs have the same lord, which cancels bhakoot dosha'
      : friendlyLords
        ? 'The two sign lords are mutual friends, which cancels bhakoot dosha'
        : sameNakshatraLord
          ? 'Both birth stars share a lord, which cancels bhakoot dosha'
          : null;

  return {
    id: 'bhakoot', name: 'Bhakoot', np: 'भकूट', score, max: 7,
    about: 'The household together — money, children, health of the family',
    finding: `The moon signs stand ${pair} apart (${bride.rashi.vedic} and ${groom.rashi.vedic}).`,
    dosha: afflicted && !cancellation,
    cancellation,
  };
}

/* ------------------------------------------------------------------ *
 * 8. Nadi — 8 gunas
 * ------------------------------------------------------------------ */

function nadiKoot(groom: Chart, bride: Chart): Koot {
  const same = groom.nakshatra.nadi === bride.nakshatra.nadi;
  const score = same ? 0 : 8;

  // The recognised exemptions: the dosha is held not to apply when the pair
  // share a birth star but sit in different padas, or share a moon sign while
  // their birth stars differ.
  const sameNakshatraDifferentPada =
    groom.nakshatra.index === bride.nakshatra.index && groom.pada !== bride.pada;
  const sameRashiDifferentNakshatra =
    groom.rashi.index === bride.rashi.index && groom.nakshatra.index !== bride.nakshatra.index;

  const cancellation = !same
    ? null
    : sameNakshatraDifferentPada
      ? 'Same birth star but different padas, which exempts the pair from nadi dosha'
      : sameRashiDifferentNakshatra
        ? 'Same moon sign but different birth stars, which exempts the pair from nadi dosha'
        : null;

  return {
    id: 'nadi', name: 'Nadi', np: 'नाडी', score, max: 8,
    about: 'Constitution and the health of children — the heaviest koot of the eight',
    finding: same
      ? `Both are ${groom.nakshatra.nadi} nadi, which is what this koot penalises.`
      : `Groom is ${groom.nakshatra.nadi} nadi and bride is ${bride.nakshatra.nadi}.`,
    dosha: same && !cancellation,
    cancellation,
  };
}

/* ------------------------------------------------------------------ *
 * The whole match
 * ------------------------------------------------------------------ */

export type MangalCompatibility = {
  groomManglik: boolean;
  brideManglik: boolean;
  compatible: boolean;
  note: string;
};

function mangalCompatibility(groom: Chart, bride: Chart): MangalCompatibility {
  const g = mangalDosha(groom);
  const b = mangalDosha(bride);
  const groomManglik = g.present && g.severity !== 'cancelled';
  const brideManglik = b.present && b.severity !== 'cancelled';

  // Two Mangliks cancel each other — the oldest remedy in the book, and the
  // reason the question is asked at all.
  const compatible = groomManglik === brideManglik;

  return {
    groomManglik,
    brideManglik,
    compatible,
    note: compatible
      ? groomManglik
        ? 'Both charts carry Mangal dosha, and matched together it cancels.'
        : 'Neither chart carries an active Mangal dosha.'
      : `Only the ${groomManglik ? 'groom' : 'bride'}’s chart carries an active Mangal dosha. This is the point a Nepali astrologer will want to look at closely before the match is fixed.`,
  };
}

export type MatchResult = {
  koots: Koot[];
  total: number;
  max: number;
  percentage: number;
  verdict: 'Excellent' | 'Very good' | 'Acceptable' | 'Difficult' | 'Not recommended';
  summary: string;
  mangal: MangalCompatibility;
  /** The koots that came out afflicted and uncancelled. */
  concerns: Koot[];
};

/** Match two charts on the eight koots. */
export function matchCharts(groom: Chart, bride: Chart): MatchResult {
  const koots = [
    varnaKoot(groom, bride),
    vashyaKoot(groom, bride),
    taraKoot(groom, bride),
    yoniKoot(groom, bride),
    grahaMaitriKoot(groom, bride),
    ganaKoot(groom, bride),
    bhakootKoot(groom, bride),
    nadiKoot(groom, bride),
  ];

  const total = koots.reduce((sum, k) => sum + k.score, 0);
  const max = koots.reduce((sum, k) => sum + k.max, 0);
  const percentage = Math.round((total / max) * 100);
  const concerns = koots.filter((k) => k.dosha);
  const mangal = mangalCompatibility(groom, bride);

  const verdict: MatchResult['verdict'] =
    total >= 32 ? 'Excellent'
      : total >= 26 ? 'Very good'
        : total >= 18 ? 'Acceptable'
          : total >= 14 ? 'Difficult'
            : 'Not recommended';

  // Eighteen is the line every Nepali family has heard of, so the summary
  // speaks to it directly rather than leaving them to work it out.
  const summary =
    total >= 18
      ? `${total} of 36 — above the eighteen that is conventionally taken as the threshold for a match.`
      : `${total} of 36 — below the conventional threshold of eighteen. That is a reason to sit with an astrologer over the details, not a final answer.`;

  return { koots, total, max, percentage, verdict, summary, mangal, concerns };
}

