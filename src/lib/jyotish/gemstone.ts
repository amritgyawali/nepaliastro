/**
 * Ratna and rudraksha — what to wear, and what not to.
 *
 * A gemstone recommendation is the easiest thing in astrology to get wrong
 * and the most expensive: a blue sapphire suits a few charts and harms many,
 * and it is routinely sold to anyone who asks. So this works from the chart's
 * own lagna — strengthening the lords that carry the chart, never the lords
 * of the houses that undo it — and says plainly which stones to avoid and why.
 */
import { GRAHAS, type GrahaId } from './ephemeris';
import { RASHIS } from './signs';
import type { Chart } from './chart';

export type Gemstone = {
  graha: GrahaId;
  name: string;
  np: string;
  alternates: string[];
  metal: string;
  finger: string;
  day: string;
  /** Rudraksha with the matching number of faces. */
  rudraksha: string;
  mantra: string;
  /** Minimum weight traditionally advised, in ratti. */
  ratti: string;
};

export const GEMSTONES: Record<GrahaId, Gemstone> = {
  sun: { graha: 'sun', name: 'Ruby', np: 'माणिक', alternates: ['Red garnet', 'Red spinel'], metal: 'Gold or copper', finger: 'Ring finger', day: 'Sunday at sunrise', rudraksha: 'Ek-mukhi (one face)', mantra: 'Om Hram Hreem Hraum Sah Suryaya Namah', ratti: '3–5 ratti' },
  moon: { graha: 'moon', name: 'Pearl', np: 'मोती', alternates: ['Moonstone'], metal: 'Silver', finger: 'Little finger', day: 'Monday evening', rudraksha: 'Do-mukhi (two faces)', mantra: 'Om Shram Shreem Shraum Sah Chandraya Namah', ratti: '4–6 ratti' },
  mars: { graha: 'mars', name: 'Red coral', np: 'मुगा', alternates: ['Carnelian'], metal: 'Copper or gold', finger: 'Ring finger', day: 'Tuesday at sunrise', rudraksha: 'Teen-mukhi (three faces)', mantra: 'Om Kram Kreem Kraum Sah Bhaumaya Namah', ratti: '6–9 ratti' },
  mercury: { graha: 'mercury', name: 'Emerald', np: 'पन्ना', alternates: ['Green tourmaline', 'Peridot'], metal: 'Gold or silver', finger: 'Little finger', day: 'Wednesday at sunrise', rudraksha: 'Char-mukhi (four faces)', mantra: 'Om Bram Breem Braum Sah Budhaya Namah', ratti: '3–6 ratti' },
  jupiter: { graha: 'jupiter', name: 'Yellow sapphire', np: 'पुखराज', alternates: ['Citrine', 'Yellow topaz'], metal: 'Gold', finger: 'Index finger', day: 'Thursday at sunrise', rudraksha: 'Panch-mukhi (five faces)', mantra: 'Om Gram Greem Graum Sah Gurave Namah', ratti: '5–7 ratti' },
  venus: { graha: 'venus', name: 'Diamond', np: 'हीरा', alternates: ['White sapphire', 'White zircon'], metal: 'Silver or platinum', finger: 'Middle finger', day: 'Friday at sunrise', rudraksha: 'Chha-mukhi (six faces)', mantra: 'Om Dram Dreem Draum Sah Shukraya Namah', ratti: '1 ratti or more' },
  saturn: { graha: 'saturn', name: 'Blue sapphire', np: 'नीलम', alternates: ['Amethyst', 'Blue zircon'], metal: 'Iron or silver', finger: 'Middle finger', day: 'Saturday evening', rudraksha: 'Saat-mukhi (seven faces)', mantra: 'Om Pram Preem Praum Sah Shanaye Namah', ratti: '5–7 ratti' },
  rahu: { graha: 'rahu', name: 'Hessonite', np: 'गोमेद', alternates: ['Brown zircon'], metal: 'Silver', finger: 'Middle finger', day: 'Saturday evening', rudraksha: 'Aath-mukhi (eight faces)', mantra: 'Om Bhram Bhreem Bhraum Sah Rahave Namah', ratti: '6–8 ratti' },
  ketu: { graha: 'ketu', name: 'Cat’s eye', np: 'लसुनिया', alternates: ['Chrysoberyl'], metal: 'Silver', finger: 'Ring finger', day: 'Tuesday evening', rudraksha: 'Nau-mukhi (nine faces)', mantra: 'Om Sram Sreem Sraum Sah Ketave Namah', ratti: '5–7 ratti' },
};

export type GemAdvice = {
  /** The stone to wear first, with the reason. */
  primary: Gemstone;
  primaryReason: string;
  /** A second stone that supports the first. */
  supporting: Gemstone | null;
  supportingReason: string | null;
  /** Stones this chart should not wear, with the reason for each. */
  avoid: { stone: Gemstone; reason: string }[];
  /** Rudraksha needs no chart and harms no one — always safe to suggest. */
  rudraksha: string;
  caution: string;
};

/**
 * Which stones suit a chart.
 *
 * The rule is the classical one: strengthen the lagna lord always, and the
 * lords of the fifth and ninth — the trine houses — because those are the
 * lords that give. Never strengthen the lords of the sixth, eighth or
 * twelfth, since a stone does not make a malefic lord kind, it makes it
 * louder.
 */
export function gemstoneFor(chart: Chart): GemAdvice {
  const lagnaIndex = chart.lagna.index;
  const lordOfHouse = (house: number) => RASHIS[(lagnaIndex + house - 1) % 12].lord;

  const lagnaLord = lordOfHouse(1);
  const fifthLord = lordOfHouse(5);
  const ninthLord = lordOfHouse(9);

  // Lords of the difficult houses. A lord that also rules a trine is spared,
  // since the trine rulership is the stronger claim.
  const trineLords = new Set([lagnaLord, fifthLord, ninthLord]);
  const maleficLords = [6, 8, 12]
    .map(lordOfHouse)
    .filter((lord) => !trineLords.has(lord));

  const supporting =
    ninthLord !== lagnaLord ? ninthLord : fifthLord !== lagnaLord ? fifthLord : null;

  const avoid = Array.from(new Set(maleficLords)).map((lord) => ({
    stone: GEMSTONES[lord],
    reason: `${GRAHAS[lord].vedic} rules a difficult house from your ${chart.lagna.vedic} lagna. Strengthening it strengthens what it brings.`,
  }));

  return {
    primary: GEMSTONES[lagnaLord],
    primaryReason: `${GRAHAS[lagnaLord].vedic} rules your ${chart.lagna.vedic} lagna, so it carries your health, your vitality and the whole chart. It is ${chart.grahas[lagnaLord].dignity.toLowerCase()} in your chart.`,
    supporting: supporting ? GEMSTONES[supporting] : null,
    supportingReason: supporting
      ? `${GRAHAS[supporting].vedic} rules a trine from your lagna — the house that gives rather than demands.`
      : null,
    avoid,
    rudraksha: GEMSTONES[lagnaLord].rudraksha,
    caution:
      'A stone is worn only after it has been energised, on its own day and hour, and only if it can be worn continuously. If it brings discomfort in the first forty days, take it off. Blue sapphire in particular is tested for a week before it is kept.',
  };
}
