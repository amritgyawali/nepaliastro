/**
 * The fixed tables of Vedic astrology.
 *
 * None of this is computed — it is the inherited reference data that the
 * rules operate on: twelve rashis, twenty-seven nakshatras, and the
 * attributes (gana, yoni, nadi, varna, vashya) that koot matching, naming
 * and dosha detection all read from. Getting one row wrong here quietly
 * corrupts every reading downstream, so each table is written out in full
 * rather than derived from a clever formula.
 */
import type { GrahaId } from './ephemeris';

/* ------------------------------------------------------------------ *
 * Rashis
 * ------------------------------------------------------------------ */

export type Element = 'Fire' | 'Earth' | 'Air' | 'Water';
export type Quality = 'Movable' | 'Fixed' | 'Dual';
export type Varna = 'Brahmin' | 'Kshatriya' | 'Vaishya' | 'Shudra';
export type Vashya = 'Chatushpada' | 'Manava' | 'Jalachara' | 'Vanachara' | 'Keeta';

export type Rashi = {
  index: number;
  /** Sanskrit name — what a Nepali chart is labelled with. */
  vedic: string;
  np: string;
  /** The same sign in the names western readers know. */
  western: string;
  glyph: string;
  lord: GrahaId;
  element: Element;
  quality: Quality;
  /** Odd signs are male, even female — used in vashya and yoni judgements. */
  gender: 'male' | 'female';
  varna: Varna;
  vashya: Vashya;
  /** Compass direction the sign governs, for vastu and travel muhurta. */
  direction: string;
  /** Kalapurusha body part, used in medical readings. */
  bodyPart: string;
};

export const RASHIS: Rashi[] = [
  { index: 0, vedic: 'Mesha', np: 'मेष', western: 'Aries', glyph: '♈', lord: 'mars', element: 'Fire', quality: 'Movable', gender: 'male', varna: 'Kshatriya', vashya: 'Chatushpada', direction: 'East', bodyPart: 'Head' },
  { index: 1, vedic: 'Vrishabha', np: 'वृष', western: 'Taurus', glyph: '♉', lord: 'venus', element: 'Earth', quality: 'Fixed', gender: 'female', varna: 'Vaishya', vashya: 'Chatushpada', direction: 'South', bodyPart: 'Face and throat' },
  { index: 2, vedic: 'Mithuna', np: 'मिथुन', western: 'Gemini', glyph: '♊', lord: 'mercury', element: 'Air', quality: 'Dual', gender: 'male', varna: 'Shudra', vashya: 'Manava', direction: 'West', bodyPart: 'Arms and shoulders' },
  { index: 3, vedic: 'Karka', np: 'कर्कट', western: 'Cancer', glyph: '♋', lord: 'moon', element: 'Water', quality: 'Movable', gender: 'female', varna: 'Brahmin', vashya: 'Jalachara', direction: 'North', bodyPart: 'Chest' },
  { index: 4, vedic: 'Simha', np: 'सिंह', western: 'Leo', glyph: '♌', lord: 'sun', element: 'Fire', quality: 'Fixed', gender: 'male', varna: 'Kshatriya', vashya: 'Vanachara', direction: 'East', bodyPart: 'Heart and stomach' },
  { index: 5, vedic: 'Kanya', np: 'कन्या', western: 'Virgo', glyph: '♍', lord: 'mercury', element: 'Earth', quality: 'Dual', gender: 'female', varna: 'Vaishya', vashya: 'Manava', direction: 'South', bodyPart: 'Abdomen' },
  { index: 6, vedic: 'Tula', np: 'तुला', western: 'Libra', glyph: '♎', lord: 'venus', element: 'Air', quality: 'Movable', gender: 'male', varna: 'Shudra', vashya: 'Manava', direction: 'West', bodyPart: 'Lower back' },
  { index: 7, vedic: 'Vrishchika', np: 'वृश्चिक', western: 'Scorpio', glyph: '♏', lord: 'mars', element: 'Water', quality: 'Fixed', gender: 'female', varna: 'Brahmin', vashya: 'Keeta', direction: 'North', bodyPart: 'Pelvis' },
  { index: 8, vedic: 'Dhanu', np: 'धनु', western: 'Sagittarius', glyph: '♐', lord: 'jupiter', element: 'Fire', quality: 'Dual', gender: 'male', varna: 'Kshatriya', vashya: 'Chatushpada', direction: 'East', bodyPart: 'Thighs' },
  { index: 9, vedic: 'Makara', np: 'मकर', western: 'Capricorn', glyph: '♑', lord: 'saturn', element: 'Earth', quality: 'Movable', gender: 'female', varna: 'Vaishya', vashya: 'Jalachara', direction: 'South', bodyPart: 'Knees' },
  { index: 10, vedic: 'Kumbha', np: 'कुम्भ', western: 'Aquarius', glyph: '♒', lord: 'saturn', element: 'Air', quality: 'Fixed', gender: 'male', varna: 'Shudra', vashya: 'Manava', direction: 'West', bodyPart: 'Calves' },
  { index: 11, vedic: 'Meena', np: 'मीन', western: 'Pisces', glyph: '♓', lord: 'jupiter', element: 'Water', quality: 'Dual', gender: 'female', varna: 'Brahmin', vashya: 'Jalachara', direction: 'North', bodyPart: 'Feet' },
];

/** The rashi a sidereal longitude falls in. */
export function rashiAt(longitude: number): Rashi {
  const wrapped = ((longitude % 360) + 360) % 360;
  return RASHIS[Math.floor(wrapped / 30) % 12];
}

/* ------------------------------------------------------------------ *
 * Nakshatras
 * ------------------------------------------------------------------ */

export type Gana = 'Deva' | 'Manushya' | 'Rakshasa';
export type Nadi = 'Adi' | 'Madhya' | 'Antya';

export type NakshatraMeta = {
  index: number;
  name: string;
  np: string;
  /** Vimshottari dasha lord — the whole dasha system hangs off this column. */
  lord: GrahaId;
  deity: string;
  symbol: string;
  gana: Gana;
  /** Yoni animal, with its gender — the sixth koot of matching. */
  yoni: string;
  yoniGender: 'male' | 'female';
  nadi: Nadi;
  /** The syllable each of the four padas gives a newborn's name. */
  syllables: [string, string, string, string];
};

const N = (
  index: number,
  name: string,
  np: string,
  lord: GrahaId,
  deity: string,
  symbol: string,
  gana: Gana,
  yoni: string,
  yoniGender: 'male' | 'female',
  nadi: Nadi,
  syllables: [string, string, string, string],
): NakshatraMeta => ({ index, name, np, lord, deity, symbol, gana, yoni, yoniGender, nadi, syllables });

export const NAKSHATRAS: NakshatraMeta[] = [
  N(0, 'Ashwini', 'अश्विनी', 'ketu', 'Ashwini Kumaras', 'Horse’s head', 'Deva', 'Horse', 'male', 'Adi', ['Chu', 'Che', 'Cho', 'La']),
  N(1, 'Bharani', 'भरणी', 'venus', 'Yama', 'Yoni', 'Manushya', 'Elephant', 'male', 'Madhya', ['Li', 'Lu', 'Le', 'Lo']),
  N(2, 'Krittika', 'कृत्तिका', 'sun', 'Agni', 'Razor', 'Rakshasa', 'Sheep', 'female', 'Antya', ['A', 'I', 'U', 'E']),
  N(3, 'Rohini', 'रोहिणी', 'moon', 'Brahma', 'Ox cart', 'Manushya', 'Serpent', 'male', 'Antya', ['O', 'Va', 'Vi', 'Vu']),
  N(4, 'Mrigashira', 'मृगशिरा', 'mars', 'Soma', 'Deer’s head', 'Deva', 'Serpent', 'female', 'Madhya', ['Ve', 'Vo', 'Ka', 'Ki']),
  N(5, 'Ardra', 'आर्द्रा', 'rahu', 'Rudra', 'Teardrop', 'Manushya', 'Dog', 'female', 'Adi', ['Ku', 'Gha', 'Nga', 'Chha']),
  N(6, 'Punarvasu', 'पुनर्वसु', 'jupiter', 'Aditi', 'Quiver of arrows', 'Deva', 'Cat', 'female', 'Adi', ['Ke', 'Ko', 'Ha', 'Hi']),
  N(7, 'Pushya', 'पुष्य', 'saturn', 'Brihaspati', 'Cow’s udder', 'Deva', 'Goat', 'male', 'Madhya', ['Hu', 'He', 'Ho', 'Da']),
  N(8, 'Ashlesha', 'आश्लेषा', 'mercury', 'Nagas', 'Coiled serpent', 'Rakshasa', 'Cat', 'male', 'Antya', ['Di', 'Du', 'De', 'Do']),
  N(9, 'Magha', 'मघा', 'ketu', 'Pitris', 'Throne', 'Rakshasa', 'Rat', 'male', 'Antya', ['Ma', 'Mi', 'Mu', 'Me']),
  N(10, 'Purva Phalguni', 'पूर्वफाल्गुनी', 'venus', 'Bhaga', 'Front legs of a bed', 'Manushya', 'Rat', 'female', 'Madhya', ['Mo', 'Ta', 'Ti', 'Tu']),
  N(11, 'Uttara Phalguni', 'उत्तरफाल्गुनी', 'sun', 'Aryaman', 'Back legs of a bed', 'Manushya', 'Cow', 'female', 'Adi', ['Te', 'To', 'Pa', 'Pi']),
  N(12, 'Hasta', 'हस्त', 'moon', 'Savitr', 'Open hand', 'Deva', 'Buffalo', 'female', 'Adi', ['Pu', 'Sha', 'Na', 'Tha']),
  N(13, 'Chitra', 'चित्रा', 'mars', 'Vishwakarma', 'Bright jewel', 'Rakshasa', 'Tiger', 'female', 'Madhya', ['Pe', 'Po', 'Ra', 'Ri']),
  N(14, 'Swati', 'स्वाती', 'rahu', 'Vayu', 'Young shoot in wind', 'Deva', 'Buffalo', 'male', 'Antya', ['Ru', 'Re', 'Ro', 'Ta']),
  N(15, 'Vishakha', 'विशाखा', 'jupiter', 'Indra and Agni', 'Triumphal arch', 'Rakshasa', 'Tiger', 'male', 'Antya', ['Ti', 'Tu', 'Te', 'To']),
  N(16, 'Anuradha', 'अनुराधा', 'saturn', 'Mitra', 'Lotus', 'Deva', 'Deer', 'female', 'Madhya', ['Na', 'Ni', 'Nu', 'Ne']),
  N(17, 'Jyeshtha', 'ज्येष्ठा', 'mercury', 'Indra', 'Circular amulet', 'Rakshasa', 'Deer', 'male', 'Adi', ['No', 'Ya', 'Yi', 'Yu']),
  N(18, 'Mula', 'मूल', 'ketu', 'Nirriti', 'Tied roots', 'Rakshasa', 'Dog', 'male', 'Adi', ['Ye', 'Yo', 'Bha', 'Bhi']),
  N(19, 'Purva Ashadha', 'पूर्वाषाढा', 'venus', 'Apah', 'Winnowing basket', 'Manushya', 'Monkey', 'male', 'Madhya', ['Bhu', 'Dha', 'Pha', 'Dha']),
  N(20, 'Uttara Ashadha', 'उत्तराषाढा', 'sun', 'Vishwadevas', 'Elephant tusk', 'Manushya', 'Mongoose', 'male', 'Antya', ['Bhe', 'Bho', 'Ja', 'Ji']),
  N(21, 'Shravana', 'श्रवण', 'moon', 'Vishnu', 'Ear', 'Deva', 'Monkey', 'female', 'Antya', ['Ju', 'Je', 'Jo', 'Gha']),
  N(22, 'Dhanishta', 'धनिष्ठा', 'mars', 'Vasus', 'Drum', 'Rakshasa', 'Lion', 'female', 'Madhya', ['Ga', 'Gi', 'Gu', 'Ge']),
  N(23, 'Shatabhisha', 'शतभिषा', 'rahu', 'Varuna', 'Empty circle', 'Rakshasa', 'Horse', 'female', 'Adi', ['Go', 'Sa', 'Si', 'Su']),
  N(24, 'Purva Bhadrapada', 'पूर्वभाद्रपदा', 'jupiter', 'Aja Ekapada', 'Front of a funeral cot', 'Manushya', 'Lion', 'male', 'Adi', ['Se', 'So', 'Da', 'Di']),
  N(25, 'Uttara Bhadrapada', 'उत्तरभाद्रपदा', 'saturn', 'Ahir Budhnya', 'Back of a funeral cot', 'Manushya', 'Cow', 'male', 'Madhya', ['Du', 'Tha', 'Jha', 'Na']),
  N(26, 'Revati', 'रेवती', 'mercury', 'Pushan', 'Fish', 'Deva', 'Elephant', 'female', 'Antya', ['De', 'Do', 'Cha', 'Chi']),
];

/** Width of one nakshatra, 13°20'. */
export const NAKSHATRA_SPAN = 360 / 27;
/** Width of one pada, 3°20' — also the width of one navamsa. */
export const PADA_SPAN = 360 / 108;

/** The nakshatra a sidereal longitude falls in, with its pada. */
export function nakshatraAt(longitude: number): { meta: NakshatraMeta; pada: number } {
  const wrapped = ((longitude % 360) + 360) % 360;
  const index = Math.floor(wrapped / NAKSHATRA_SPAN) % 27;
  return {
    meta: NAKSHATRAS[index],
    pada: Math.floor((wrapped % NAKSHATRA_SPAN) / PADA_SPAN) + 1,
  };
}

/* ------------------------------------------------------------------ *
 * Dignity
 * ------------------------------------------------------------------ */

/** Signs each graha rules. Rahu and Ketu are co-lords by later convention. */
export const OWN_SIGNS: Record<GrahaId, number[]> = {
  sun: [4],
  moon: [3],
  mars: [0, 7],
  mercury: [2, 5],
  jupiter: [8, 11],
  venus: [1, 6],
  saturn: [9, 10],
  rahu: [10],
  ketu: [7],
};

/** Sign and exact degree of exaltation; debilitation sits opposite. */
export const EXALTATION: Record<GrahaId, { rashi: number; degree: number }> = {
  sun: { rashi: 0, degree: 10 },
  moon: { rashi: 1, degree: 3 },
  mars: { rashi: 9, degree: 28 },
  mercury: { rashi: 5, degree: 15 },
  jupiter: { rashi: 3, degree: 5 },
  venus: { rashi: 11, degree: 27 },
  saturn: { rashi: 6, degree: 20 },
  rahu: { rashi: 1, degree: 20 },
  ketu: { rashi: 7, degree: 20 },
};

/** Moolatrikona stretch — stronger than own sign, weaker than exaltation. */
export const MOOLATRIKONA: Partial<Record<GrahaId, { rashi: number; from: number; to: number }>> = {
  sun: { rashi: 4, from: 0, to: 20 },
  moon: { rashi: 1, from: 4, to: 30 },
  mars: { rashi: 0, from: 0, to: 12 },
  mercury: { rashi: 5, from: 16, to: 20 },
  jupiter: { rashi: 8, from: 0, to: 10 },
  venus: { rashi: 6, from: 0, to: 15 },
  saturn: { rashi: 10, from: 0, to: 20 },
};

export type Friendship = 'friend' | 'neutral' | 'enemy';

/** Naisargika maitri — the permanent friendships, as Parashara gives them. */
export const FRIENDSHIP: Record<GrahaId, Partial<Record<GrahaId, Friendship>>> = {
  sun: { moon: 'friend', mars: 'friend', jupiter: 'friend', mercury: 'neutral', venus: 'enemy', saturn: 'enemy' },
  moon: { sun: 'friend', mercury: 'friend', mars: 'neutral', jupiter: 'neutral', venus: 'neutral', saturn: 'neutral' },
  mars: { sun: 'friend', moon: 'friend', jupiter: 'friend', venus: 'neutral', saturn: 'neutral', mercury: 'enemy' },
  mercury: { sun: 'friend', venus: 'friend', mars: 'neutral', jupiter: 'neutral', saturn: 'neutral', moon: 'enemy' },
  jupiter: { sun: 'friend', moon: 'friend', mars: 'friend', saturn: 'neutral', mercury: 'enemy', venus: 'enemy' },
  venus: { mercury: 'friend', saturn: 'friend', mars: 'neutral', jupiter: 'neutral', sun: 'enemy', moon: 'enemy' },
  saturn: { mercury: 'friend', venus: 'friend', jupiter: 'neutral', sun: 'enemy', moon: 'enemy', mars: 'enemy' },
  // The nodes take the friendships of the sign lord they sit with; these are
  // the commonly used defaults where a table demands a value.
  rahu: { venus: 'friend', saturn: 'friend', mercury: 'friend', sun: 'enemy', moon: 'enemy', mars: 'enemy' },
  ketu: { mars: 'friend', venus: 'friend', saturn: 'friend', sun: 'enemy', moon: 'enemy', mercury: 'enemy' },
};

/** How two grahas regard each other, for graha maitri and dignity. */
export function friendshipBetween(from: GrahaId, to: GrahaId): Friendship {
  if (from === to) return 'friend';
  return FRIENDSHIP[from]?.[to] ?? 'neutral';
}
