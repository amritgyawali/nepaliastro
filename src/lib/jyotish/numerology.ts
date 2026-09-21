/**
 * Ank jyotish — numerology, the way it is practised alongside jyotish.
 *
 * Every number is tied back to a graha, so a numerology reading and a chart
 * reading speak the same language: mulank 8 is Shani whether it arrives from
 * a birth date or from a chart, and the remedies are the same remedies.
 */
import { GRAHAS, type GrahaId } from './ephemeris';
import { GRAHA_TRAITS } from './lucky';

/** Which graha owns each number, 1–9. */
export const NUMBER_LORD: Record<number, GrahaId> = {
  1: 'sun', 2: 'moon', 3: 'jupiter', 4: 'rahu', 5: 'mercury',
  6: 'venus', 7: 'ketu', 8: 'saturn', 9: 'mars',
};

/** Add digits until one remains. 29 -> 11 -> 2. */
function reduceToDigit(value: number): number {
  let n = Math.abs(Math.trunc(value));
  while (n > 9) {
    n = `${n}`.split('').reduce((sum, d) => sum + Number(d), 0);
  }
  return n || 9;
}

/**
 * Chaldean letter values.
 *
 * Chaldean rather than Pythagorean: it is the system Vedic numerology uses,
 * and it assigns no letter to nine, which is held to be sacred.
 */
const CHALDEAN: Record<string, number> = {
  A: 1, I: 1, J: 1, Q: 1, Y: 1,
  B: 2, K: 2, R: 2,
  C: 3, G: 3, L: 3, S: 3,
  D: 4, M: 4, T: 4,
  E: 5, H: 5, N: 5, X: 5,
  U: 6, V: 6, W: 6,
  O: 7, Z: 7,
  F: 8, P: 8,
};

const NUMBER_TRAITS: Record<number, { title: string; strengths: string[]; watch: string[] }> = {
  1: { title: 'The one who leads', strengths: ['Decides quickly and stands by it', 'Works better in charge than in a team', 'Recovers from setbacks fast'], watch: ['Takes disagreement as a challenge', 'Impatient with slower people'] },
  2: { title: 'The one who senses', strengths: ['Reads a room before anyone speaks', 'Makes peace between people', 'Loyal beyond reason'], watch: ['Moods swing with the moon', 'Avoids confrontation until it is too late'] },
  3: { title: 'The one who teaches', strengths: ['Explains things so people remember', 'Draws mentors and good advice', 'Optimism that survives bad years'], watch: ['Promises more than the day holds', 'Preaches when asked for help'] },
  4: { title: 'The one who breaks the mould', strengths: ['Sees what everyone else missed', 'Unbothered by convention', 'Thrives where rules are still being written'], watch: ['Sudden reversals, often self-made', 'Restless in anything settled'] },
  5: { title: 'The one who trades', strengths: ['Quick with words, numbers and people', 'Adapts faster than circumstances change', 'Naturally good at commerce'], watch: ['Starts more than can be finished', 'Nervous energy that needs an outlet'] },
  6: { title: 'The one who builds a home', strengths: ['Makes beauty and comfort wherever they land', 'Draws people and money without asking', 'Steady in relationships'], watch: ['Comfort can slide into indulgence', 'Takes on other people’s burdens'] },
  7: { title: 'The one who withdraws', strengths: ['Thinks deeper than the question asked', 'Unimpressed by status', 'Genuine spiritual instinct'], watch: ['Isolation that becomes a habit', 'Hard to reach, even for family'] },
  8: { title: 'The one who endures', strengths: ['Outlasts everyone else in the room', 'Builds things that hold', 'Respect earned slowly and kept'], watch: ['Results come late — always later than deserved', 'Carries weight that could be set down'] },
  9: { title: 'The one who fights', strengths: ['Courage that does not need an audience', 'Protects whoever is theirs', 'Finishes what was started'], watch: ['Anger arrives before judgement', 'Burns energy on battles not worth it'] },
};

export type NumerologyReading = {
  /** Mulank — from the day of the month alone. */
  mulank: number;
  mulankLord: GrahaId;
  /** Bhagyank — from the whole date of birth. */
  bhagyank: number;
  bhagyankLord: GrahaId;
  /** Namank — from the name, by Chaldean values. */
  namank: number | null;
  namankLord: GrahaId | null;
  /** Counts of each digit 1–9 in the date of birth, for the Lo Shu grid. */
  loShu: Record<number, number>;
  /** Digits missing from the grid entirely. */
  missing: number[];
  /** Digits appearing more than once. */
  repeated: number[];
  traits: { title: string; strengths: string[]; watch: string[] };
  luckyNumbers: number[];
  luckyColours: string[];
  luckyDay: string;
  /** Whether mulank and bhagyank pull together or against each other. */
  harmony: { compatible: boolean; note: string };
};

/** Numbers that sit badly with each other, by their graha lords. */
const NUMBER_ENMITY: Record<number, number[]> = {
  1: [8, 4], 2: [4, 8, 9], 3: [6], 4: [1, 2, 8],
  5: [], 6: [3, 9], 7: [], 8: [1, 2, 4], 9: [2, 6],
};

export function numerologyFor(
  birth: { day: number; month: number; year: number },
  name?: string,
): NumerologyReading {
  const mulank = reduceToDigit(birth.day);
  const digits = `${birth.day}${birth.month}${birth.year}`.replace(/\D/g, '');
  const bhagyank = reduceToDigit(
    digits.split('').reduce((sum, d) => sum + Number(d), 0),
  );

  const cleanName = (name ?? '').toUpperCase().replace(/[^A-Z]/g, '');
  const namank = cleanName
    ? reduceToDigit(cleanName.split('').reduce((sum, c) => sum + (CHALDEAN[c] ?? 0), 0))
    : null;

  // The Lo Shu grid counts how often each digit appears in the date itself.
  const loShu: Record<number, number> = {};
  for (let i = 1; i <= 9; i += 1) loShu[i] = 0;
  for (const d of digits) {
    const n = Number(d);
    if (n >= 1 && n <= 9) loShu[n] += 1;
  }

  const compatible = !NUMBER_ENMITY[mulank]?.includes(bhagyank);
  const mulankLord = NUMBER_LORD[mulank];
  const bhagyankLord = NUMBER_LORD[bhagyank];

  return {
    mulank,
    mulankLord,
    bhagyank,
    bhagyankLord,
    namank,
    namankLord: namank ? NUMBER_LORD[namank] : null,
    loShu,
    missing: Object.entries(loShu).filter(([, n]) => n === 0).map(([d]) => Number(d)),
    repeated: Object.entries(loShu).filter(([, n]) => n > 1).map(([d]) => Number(d)),
    traits: NUMBER_TRAITS[mulank],
    luckyNumbers: Array.from(new Set([mulank, bhagyank, GRAHA_TRAITS[mulankLord].number])),
    luckyColours: GRAHA_TRAITS[mulankLord].colours,
    luckyDay: GRAHA_TRAITS[mulankLord].day,
    harmony: {
      compatible,
      note: compatible
        ? `Mulank ${mulank} (${GRAHAS[mulankLord].vedic}) and bhagyank ${bhagyank} (${GRAHAS[bhagyankLord].vedic}) pull the same way — what you want and what you are given tend to agree.`
        : `Mulank ${mulank} (${GRAHAS[mulankLord].vedic}) and bhagyank ${bhagyank} (${GRAHAS[bhagyankLord].vedic}) work against each other — effort and outcome often point in different directions, and timing matters more for you than for most.`,
    },
  };
}

/** A name's Chaldean number, for testing a spelling before choosing it. */
export function nameNumber(name: string): number | null {
  const clean = name.toUpperCase().replace(/[^A-Z]/g, '');
  if (!clean) return null;
  return reduceToDigit(clean.split('').reduce((sum, c) => sum + (CHALDEAN[c] ?? 0), 0));
}
