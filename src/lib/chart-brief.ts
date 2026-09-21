/**
 * The person, written out for the AI.
 *
 * Both the five-hourly reading and the AI Astrologer Baba chat answer from the
 * same thing: the chart the engine in `jyotish/` computes from the birth
 * details, and where the sky is now relative to it. Nothing here is invented —
 * every line is a fact the engine derived, and where the engine cannot say
 * (an unknown birth time, a cancelled dosha) the brief says so rather than
 * letting the model fill the gap.
 */
import type { OnboardingProfile } from '@/store/onboarding';

import {
  allDoshas,
  chartFor,
  dashaAt,
  describeBirth,
  GRAHAS,
  nepaliClock,
  tithiAt,
  vimshottariDasha,
  VARA,
  type Chart,
  type GrahaId,
} from './jyotish';
import { factsFor, ordinal, type PredictionFacts } from './predictions';

/** The person, as much of them as an answer is allowed to lean on. */
export type AiPerson = {
  firstName: string;
  gender: string;
  /** Date, time and place, already written out by the engine. */
  birthDetails: string;
  /** The language the answer should be written in. */
  language: string;
};

export function personFor(profile: OnboardingProfile, chart: Chart): AiPerson {
  return {
    firstName: profile.name.trim().split(/\s+/)[0] ?? '',
    gender: profile.gender ?? 'not given',
    birthDetails: describeBirth(chart.moment),
    language: profile.languages[0] ?? 'English',
  };
}

/**
 * A graha's name, not its id.
 *
 * The engine identifies a lord by a lowercase key (`sun`, `ketu`); writing
 * that into the brief teaches the model to call Surya "sun" and to lowercase
 * it mid-sentence when it answers.
 */
export function grahaName(id: GrahaId): string {
  return GRAHAS[id].vedic;
}

/** Who they are, in the four lines an astrologer would ask for first. */
export function whoBrief(person: AiPerson): string {
  return [
    'The person',
    `- first name: ${person.firstName || 'not given'}`,
    `- gender: ${person.gender}`,
    `- born: ${person.birthDetails}`,
    `- write in: ${person.language}`,
  ].join('\n');
}

/** The running mahadasha, or a line saying there is none to quote. */
export function dashaLineFor(chart: Chart): string {
  const running = dashaAt(vimshottariDasha(chart, 2));
  if (!running) return 'not available';
  return `${running.maha.lordName} mahadasha${
    running.antar ? `, ${running.antar.lordName} antardasha` : ''
  }`;
}

/**
 * The doshas that are actually active.
 *
 * A dosha the engine finds cancelled is reported as absent rather than as a
 * caveat for the model to weigh — a cancelled Mangal dosha is not a small
 * Mangal dosha, and a person should not be told it is.
 */
export function doshaLineFor(chart: Chart): string {
  const active = allDoshas(chart).filter(
    (dosha) => dosha.present && dosha.severity !== 'cancelled',
  );
  return active.length
    ? active.map((dosha) => `${dosha.name} (${dosha.severity})`).join(', ')
    : 'none active';
}

/** Their chart, as the engine computes it. */
export function kundliBrief(chart: Chart): string {
  const birthTithi = tithiAt(chart.moment.at);
  const birthVara = VARA[nepaliClock(chart.moment.at).weekday].en;

  return [
    'Their kundli, computed from those birth details',
    `- moon sign (rashi): ${chart.rashi.vedic} / ${chart.rashi.western}, lord ${grahaName(chart.rashi.lord)}`,
    `- birth nakshatra: ${chart.nakshatra.name}, pada ${chart.pada}, lord ${grahaName(chart.nakshatra.lord)}`,
    `- sidereal sun sign: ${chart.sunRashi.vedic} / ${chart.sunRashi.western}`,
    `- lagna (ascendant): ${
      chart.approximate
        ? 'unknown — they did not give an exact birth time, so do not mention the rising sign or any house placement'
        : chart.lagna.vedic
    }`,
    `- tithi at birth: ${birthTithi.paksha} ${birthTithi.name}, born on a ${birthVara}`,
    `- running dasha: ${dashaLineFor(chart)}`,
    `- doshas active: ${doshaLineFor(chart)}`,
  ].join('\n');
}

/** Where the sky is now, read against that chart. */
export function transitBrief(facts: PredictionFacts): string {
  return [
    'The sky right now, read against their chart',
    `- moon today: ${facts.moonNakshatra.name} nakshatra, ${facts.moonRashi.vedic} rashi`,
    `- that is transiting their ${ordinal(facts.house)} house (${facts.houseName}) counted from their natal moon — the house of ${facts.houseTheme}`,
    `- tithi: ${facts.tithi.paksha} ${facts.tithi.name}`,
    `- weekday: ${facts.vara}, lord ${facts.varaLord}`,
    `- favourable hours today: ${facts.window}`,
  ].join('\n');
}

export type ChartBrief = {
  person: AiPerson;
  chart: Chart;
  facts: PredictionFacts;
  /** The three sections above, joined — what the model is handed. */
  text: string;
};

/**
 * Everything the AI needs about one person, or `null` when there is no birth
 * date yet and therefore nothing honest to say.
 *
 * The chart is built here if no screen has asked for one yet: the birth
 * details are all it ever needed, so a person who has never opened the Kundli
 * screen still gets an answer read from their own chart.
 */
export function chartBriefFor(profile: OnboardingProfile, at = new Date()): ChartBrief | null {
  const chart = chartFor(profile);
  if (!chart) return null;

  const facts = factsFor(profile, at);
  if (!facts) return null;

  const person = personFor(profile, chart);

  return {
    person,
    chart,
    facts,
    text: [whoBrief(person), kundliBrief(chart), transitBrief(facts)].join('\n\n'),
  };
}
