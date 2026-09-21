/**
 * Shubha rang, shubha ank, shubha disha — the small daily answers.
 *
 * These are the questions asked most often and answered most carelessly: a
 * lucky colour is usually pulled from a list of twelve and repeated all year.
 * Here it follows from something real — the lord of the day, the lord of the
 * moon's current nakshatra, and the person's own moon sign — so it changes
 * daily and differs between two people on the same day, which is the whole
 * point of asking.
 */
import { GRAHAS, siderealLongitude, type GrahaId } from './ephemeris';
import { RASHIS, nakshatraAt } from './signs';
import { VARA } from './time';
import type { Chart } from './chart';

export type GrahaTraits = {
  colours: string[];
  colourNp: string;
  /** Hex, so a screen can actually paint the swatch. */
  swatch: string[];
  number: number;
  direction: string;
  metal: string;
  gem: string;
  day: string;
};

/** What each graha governs, for colour, number, direction and metal. */
export const GRAHA_TRAITS: Record<GrahaId, GrahaTraits> = {
  sun: {
    colours: ['Saffron', 'Deep orange', 'Copper red'], colourNp: 'केसरी',
    swatch: ['#FF9933', '#E2571E', '#B7410E'],
    number: 1, direction: 'East', metal: 'Copper', gem: 'Ruby', day: 'Sunday',
  },
  moon: {
    colours: ['White', 'Cream', 'Silver'], colourNp: 'सेतो',
    swatch: ['#FFFFFF', '#F4EFE2', '#C9CDD2'],
    number: 2, direction: 'North-west', metal: 'Silver', gem: 'Pearl', day: 'Monday',
  },
  mars: {
    colours: ['Red', 'Coral', 'Maroon'], colourNp: 'रातो',
    swatch: ['#C0392B', '#E8735A', '#7B241C'],
    number: 9, direction: 'South', metal: 'Copper', gem: 'Red coral', day: 'Tuesday',
  },
  mercury: {
    colours: ['Green', 'Emerald', 'Olive'], colourNp: 'हरियो',
    swatch: ['#1F7A46', '#2ECC71', '#6E8B3D'],
    number: 5, direction: 'North', metal: 'Bronze', gem: 'Emerald', day: 'Wednesday',
  },
  jupiter: {
    colours: ['Yellow', 'Gold', 'Turmeric'], colourNp: 'पहेँलो',
    swatch: ['#F1C40F', '#D4AF37', '#E1AD21'],
    number: 3, direction: 'North-east', metal: 'Gold', gem: 'Yellow sapphire', day: 'Thursday',
  },
  venus: {
    colours: ['White', 'Pink', 'Pastel blue'], colourNp: 'गुलाबी',
    swatch: ['#FFFFFF', '#F5B7B1', '#AED6F1'],
    number: 6, direction: 'South-east', metal: 'Silver', gem: 'Diamond', day: 'Friday',
  },
  saturn: {
    colours: ['Dark blue', 'Black', 'Deep grey'], colourNp: 'निलो',
    swatch: ['#1B2A41', '#17202A', '#4D5656'],
    number: 8, direction: 'West', metal: 'Iron', gem: 'Blue sapphire', day: 'Saturday',
  },
  rahu: {
    colours: ['Smoky grey', 'Dark blue'], colourNp: 'धुवाँ रङ',
    swatch: ['#5D6D7E', '#2C3E50'],
    number: 4, direction: 'South-west', metal: 'Lead', gem: 'Hessonite', day: 'Saturday',
  },
  ketu: {
    colours: ['Brown', 'Grey', 'Variegated'], colourNp: 'खैरो',
    swatch: ['#8B5E3C', '#7F8C8D', '#A0522D'],
    number: 7, direction: 'North-west', metal: 'Mixed', gem: 'Cat’s eye', day: 'Tuesday',
  },
};

export type LuckySet = {
  date: Date;
  /** Lord of the weekday. */
  dayLord: GrahaId;
  /** Lord of the nakshatra the moon is crossing today. */
  starLord: GrahaId;
  colours: string[];
  swatch: string[];
  colourNp: string;
  numbers: number[];
  direction: string;
  metal: string;
  /** Why these, in one line. */
  reason: string;
  /** Present only when the person's chart is known. */
  personal: {
    rashiLord: GrahaId;
    rashiColour: string[];
    avoid: string[];
  } | null;
};

/**
 * The day's lucky set.
 *
 * Two lords decide it: the weekday's, which everyone shares, and the lord of
 * the nakshatra the moon is actually crossing, which changes about once a
 * day and is what makes the answer different from a fixed table. With a chart
 * in hand the person's own moon-sign lord is added, and the colours of the
 * grahas that trouble that sign are named as the ones to leave off.
 */
export function luckyFor(at: Date = new Date(), chart: Chart | null = null): LuckySet {
  const weekday = new Date(at.getTime() + 345 * 60_000).getUTCDay();
  const dayLord = VARA[weekday].lord.toLowerCase() as GrahaId;
  const starLord = nakshatraAt(siderealLongitude('moon', at)).meta.lord;

  const dayTraits = GRAHA_TRAITS[dayLord];
  const starTraits = GRAHA_TRAITS[starLord];

  // The day lord leads; the star lord adds one colour of its own, unless they
  // happen to be the same graha, in which case the day's own list stands.
  const colours =
    dayLord === starLord
      ? dayTraits.colours
      : [...dayTraits.colours.slice(0, 2), starTraits.colours[0]];
  const swatch =
    dayLord === starLord
      ? dayTraits.swatch
      : [...dayTraits.swatch.slice(0, 2), starTraits.swatch[0]];

  const numbers = Array.from(new Set([dayTraits.number, starTraits.number]));

  let personal: LuckySet['personal'] = null;
  if (chart) {
    const rashiLord = chart.rashi.lord;
    numbers.push(GRAHA_TRAITS[rashiLord].number);
    // The sixth, eighth and twelfth lords from the moon are the ones whose
    // colours are traditionally left off on a day that already feels heavy.
    const avoidLords = [5, 7, 11].map(
      (offset) => RASHIS[(chart.rashi.index + offset) % 12].lord,
    );
    personal = {
      rashiLord,
      rashiColour: GRAHA_TRAITS[rashiLord].colours,
      avoid: Array.from(new Set(avoidLords.flatMap((l) => GRAHA_TRAITS[l].colours.slice(0, 1)))),
    };
  }

  return {
    date: at,
    dayLord,
    starLord,
    colours,
    swatch,
    colourNp: dayTraits.colourNp,
    numbers: Array.from(new Set(numbers)),
    direction: dayTraits.direction,
    metal: dayTraits.metal,
    reason:
      dayLord === starLord
        ? `${VARA[weekday].en} belongs to ${GRAHAS[dayLord].vedic}, and the moon is crossing its own nakshatra today — so the day speaks with one voice.`
        : `${VARA[weekday].en} belongs to ${GRAHAS[dayLord].vedic}, and the moon is crossing ${GRAHAS[starLord].vedic}'s nakshatra.`,
    personal,
  };
}

/** Lucky colours and numbers for a rashi, for the twelve-sign listing. */
export function luckyForRashi(rashiIndex: number): {
  rashi: string;
  lord: GrahaId;
  colours: string[];
  swatch: string[];
  numbers: number[];
  direction: string;
  day: string;
  gem: string;
} {
  const rashi = RASHIS[rashiIndex];
  const traits = GRAHA_TRAITS[rashi.lord];
  return {
    rashi: rashi.vedic,
    lord: rashi.lord,
    colours: traits.colours,
    swatch: traits.swatch,
    numbers: [traits.number],
    direction: traits.direction,
    day: traits.day,
    gem: traits.gem,
  };
}
