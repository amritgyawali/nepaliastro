/**
 * The person, written out for the AI.
 *
 * Both the five-hourly reading and the AI Astrologer Baba chat answer from the
 * same thing: the kundli computed in `kundli.ts` and where the moon is now
 * relative to it. Nothing here is invented — every line is a fact the app has
 * already derived from the birth details, and if a detail is missing the brief
 * says so rather than letting the model fill the gap.
 */
import type { OnboardingProfile } from '@/store/onboarding';

import { formatBirthMoment, kundliFor, type Kundli } from './kundli';
import { factsFor, ordinal, type PredictionFacts } from './predictions';

/** The person, as much of them as an answer is allowed to lean on. */
export type AiPerson = {
  firstName: string;
  gender: string;
  birthDetails: string;
  birthPlace: string;
  /** The language the answer should be written in. */
  language: string;
};

export function personFor(profile: OnboardingProfile, kundli: Kundli): AiPerson {
  return {
    firstName: profile.name.trim().split(/\s+/)[0] ?? '',
    gender: profile.gender ?? 'not given',
    birthDetails: formatBirthMoment(kundli.moment),
    birthPlace: profile.birthPlace.trim() || 'Kathmandu, Nepal',
    language: profile.languages[0] ?? 'English',
  };
}

/** Who they are, in the four lines an astrologer would ask for first. */
export function whoBrief(person: AiPerson): string {
  return [
    'The person',
    `- first name: ${person.firstName || 'not given'}`,
    `- gender: ${person.gender}`,
    `- born: ${person.birthDetails} in ${person.birthPlace}`,
    `- write in: ${person.language}`,
  ].join('\n');
}

/** Their chart: the placements `kundli.ts` can honestly compute. */
export function kundliBrief(chart: Kundli): string {
  return [
    'Their kundli, computed from those birth details',
    `- moon sign (rashi): ${chart.rashi.vedic} / ${chart.rashi.western}, lord ${chart.rashi.lord}, ${chart.rashi.element} sign`,
    `- birth nakshatra: ${chart.nakshatra.name}, pada ${chart.nakshatra.pada}`,
    `- sidereal sun sign: ${chart.sunRashi.vedic} / ${chart.sunRashi.western}`,
    `- lagna (ascendant): ${
      chart.lagna
        ? `${chart.lagna.vedic} — estimated from sunrise, so treat it as approximate`
        : 'unknown — they did not give an exact birth time, so do not mention the rising sign'
    }`,
    `- tithi at birth: ${chart.tithi.paksha} ${chart.tithi.name}`,
    `- born on a ${chart.vara}`,
    '- the other seven grahas are NOT computed. Never name a placement, dasha or aspect that is not in this brief.',
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
  kundli: Kundli;
  facts: PredictionFacts;
  /** The three sections above, joined — what the model is handed. */
  text: string;
};

/**
 * Everything the AI needs about one person, or `null` when there is no birth
 * date yet and therefore nothing honest to say.
 *
 * The kundli is generated here if the app has not shown it yet: the birth
 * details are all it ever needed, so a person who has never opened the Kundli
 * screen still gets an answer read from their own chart.
 */
export function chartBriefFor(profile: OnboardingProfile, at = new Date()): ChartBrief | null {
  const kundli = kundliFor(profile);
  if (!kundli) return null;

  const facts = factsFor(profile, at);
  if (!facts) return null;

  const person = personFor(profile, kundli);

  return {
    person,
    kundli,
    facts,
    text: [whoBrief(person), kundliBrief(kundli), transitBrief(facts)].join('\n\n'),
  };
}
