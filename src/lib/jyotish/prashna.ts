/**
 * Prashna — the question itself, answered from the moment it was asked.
 *
 * Horary needs no birth details at all, which makes it the one reading
 * available to someone who does not know when they were born — and in Nepal
 * that is a great many people, especially older women whose births were never
 * registered. The chart is cast for the instant the question is put, and the
 * answer is read from the house the question belongs to.
 */
import { GRAHAS, type GrahaId } from './ephemeris';
import { buildChart, type Chart } from './chart';
import { KATHMANDU, type Place } from './places';
import { RASHIS } from './signs';

export type QuestionTopic = {
  id: string;
  label: string;
  np: string;
  /** The house that answers this kind of question. */
  house: number;
};

export const TOPICS: QuestionTopic[] = [
  { id: 'health', label: 'My health', np: 'स्वास्थ्य', house: 1 },
  { id: 'money', label: 'Money I am owed or expecting', np: 'धन', house: 2 },
  { id: 'courage', label: 'Should I take this risk', np: 'साहस', house: 3 },
  { id: 'property', label: 'A house, land or vehicle', np: 'घरजग्गा', house: 4 },
  { id: 'children', label: 'Children, or a creative venture', np: 'सन्तान', house: 5 },
  { id: 'dispute', label: 'A dispute, debt or illness', np: 'रोग र ऋण', house: 6 },
  { id: 'marriage', label: 'Marriage or a partnership', np: 'विवाह', house: 7 },
  { id: 'obstacle', label: 'Something hidden or stuck', np: 'बाधा', house: 8 },
  { id: 'fortune', label: 'Travel, study or fortune', np: 'भाग्य', house: 9 },
  { id: 'career', label: 'My job or business', np: 'कर्म', house: 10 },
  { id: 'gain', label: 'Will this bring gain', np: 'लाभ', house: 11 },
  { id: 'foreign', label: 'Going abroad', np: 'विदेश', house: 12 },
];

export type PrashnaReading = {
  askedAt: Date;
  topic: QuestionTopic;
  chart: Chart;
  /** The sign rising when the question was asked. */
  lagna: string;
  /** Where the moon stood — the mind of the querent. */
  moon: { rashi: string; house: number; nakshatra: string };
  leaning: 'yes' | 'likely' | 'unclear' | 'unlikely' | 'no';
  /** 0–100 confidence in the leaning. */
  confidence: number;
  reasons: string[];
  timing: string;
  caution: string;
};

const BENEFICS: GrahaId[] = ['jupiter', 'venus', 'mercury', 'moon'];

/**
 * Read a question.
 *
 * The judgement rests on three things the classics agree on: the strength of
 * the house that owns the question, where its lord has gone, and what the
 * moon — which stands for the querent's own mind — is doing.
 */
export function prashnaFor(
  topic: QuestionTopic,
  askedAt: Date = new Date(),
  place: Place = KATHMANDU,
): PrashnaReading {
  const chart = buildChart({ at: askedAt, place, timeKnown: true });
  const reasons: string[] = [];
  let score = 50;

  const houseRashi = chart.houses[topic.house - 1].rashi;
  const houseLord = houseRashi.lord;
  const lordPosition = chart.grahas[houseLord];

  // Where has the lord of the question's house gone?
  if ([1, 4, 5, 7, 9, 10, 11].includes(lordPosition.house)) {
    score += 18;
    reasons.push(`${GRAHAS[houseLord].vedic}, lord of the ${topic.house}th, has gone to the ${lordPosition.house}th — a house that supports the matter.`);
  } else if ([6, 8, 12].includes(lordPosition.house)) {
    score -= 20;
    reasons.push(`${GRAHAS[houseLord].vedic}, lord of the ${topic.house}th, has fallen into the ${lordPosition.house}th — the matter is obstructed.`);
  } else {
    reasons.push(`${GRAHAS[houseLord].vedic}, lord of the ${topic.house}th, stands in the ${lordPosition.house}th.`);
  }

  // Its condition.
  if (['Exalted', 'Own sign', 'Moolatrikona'].includes(lordPosition.dignity)) {
    score += 14;
    reasons.push(`It is ${lordPosition.dignity.toLowerCase()}, so it can act.`);
  } else if (lordPosition.dignity === 'Debilitated') {
    score -= 16;
    reasons.push('It is debilitated, and cannot deliver what is asked of it.');
  }
  if (lordPosition.combust) {
    score -= 12;
    reasons.push('It is combust — burnt by the sun, and unable to show its hand.');
  }
  if (lordPosition.retrograde && !lordPosition.graha.shadow) {
    score -= 6;
    reasons.push('It is retrograde, which usually means a return to something already begun rather than a clean forward step.');
  }

  // Occupants of the house itself.
  const occupants = chart.houses[topic.house - 1].grahas;
  const goodOccupants = occupants.filter((g) => BENEFICS.includes(g.graha.id));
  const badOccupants = occupants.filter((g) => !BENEFICS.includes(g.graha.id));
  if (goodOccupants.length) {
    score += 10 * goodOccupants.length;
    reasons.push(`${goodOccupants.map((g) => g.graha.vedic).join(' and ')} sits in the house itself, which favours it.`);
  }
  if (badOccupants.length) {
    score -= 8 * badOccupants.length;
    reasons.push(`${badOccupants.map((g) => g.graha.vedic).join(' and ')} occupies the house, which works against a clean outcome.`);
  }

  // The moon — the querent's own mind, and whether it is settled.
  const moon = chart.grahas.moon;
  if ([6, 8, 12].includes(moon.house)) {
    score -= 10;
    reasons.push('The moon stands in a difficult house, so the question is being asked from an unsettled mind.');
  } else if ([1, 4, 5, 7, 9, 10].includes(moon.house)) {
    score += 8;
    reasons.push('The moon is well placed, so the question is clearly held.');
  }

  score = Math.max(0, Math.min(100, score));

  const leaning: PrashnaReading['leaning'] =
    score >= 72 ? 'yes' : score >= 58 ? 'likely' : score >= 43 ? 'unclear' : score >= 28 ? 'unlikely' : 'no';

  // Timing follows the movable/fixed/dual nature of the rising sign, which is
  // the classical prashna rule: movable is soon, fixed is slow, dual is twice.
  const quality = chart.lagna.quality;
  const timing =
    quality === 'Movable'
      ? 'A movable sign rises, so the matter moves quickly — expect it to turn within weeks rather than months.'
      : quality === 'Fixed'
        ? 'A fixed sign rises, so this will take its own time. Months, not weeks, and pushing will not shorten it.'
        : 'A dual sign rises, which classically means it happens twice, or after one false start.';

  return {
    askedAt,
    topic,
    chart,
    lagna: chart.lagna.vedic,
    moon: { rashi: RASHIS[moon.rashi].vedic, house: moon.house, nakshatra: moon.nakshatraMeta.name },
    leaning,
    confidence: Math.abs(score - 50) * 2,
    reasons,
    timing,
    caution:
      'Prashna answers the question as it stood at the moment it was asked. Asking the same thing again an hour later gives a different chart, and the first answer is the one that counts.',
  };
}
