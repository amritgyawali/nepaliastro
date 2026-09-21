/**
 * Namkaran — the syllable a newborn's name should begin with.
 *
 * The moon's nakshatra and pada at the moment of birth give one syllable out
 * of a hundred and eight, and the child's name traditionally starts with it.
 * This is the reading parents come for in the first two weeks of a life, so
 * it also returns the ceremony's own timing and a set of names that actually
 * begin with the right sound.
 */
import { NAKSHATRAS } from './signs';
import type { Chart } from './chart';

export type NameSuggestion = { name: string; np: string; meaning: string };

/**
 * Names by starting syllable.
 *
 * Nepali names rather than a generic Sanskrit list — these are names a child
 * in Kathmandu or Biratnagar will actually be called by.
 */
const NAMES: Record<string, NameSuggestion[]> = {
  Chu: [{ name: 'Chudamani', np: 'चूडामणि', meaning: 'Crest jewel' }, { name: 'Chumbak', np: 'चुम्बक', meaning: 'Magnet, the one who draws' }],
  Che: [{ name: 'Chetana', np: 'चेतना', meaning: 'Consciousness' }, { name: 'Chetan', np: 'चेतन', meaning: 'Awake, aware' }],
  Cho: [{ name: 'Chodan', np: 'चोदन', meaning: 'One who urges forward' }],
  La: [{ name: 'Laxmi', np: 'लक्ष्मी', meaning: 'Goddess of fortune' }, { name: 'Lalit', np: 'ललित', meaning: 'Graceful' }, { name: 'Laxman', np: 'लक्ष्मण', meaning: 'One with auspicious marks' }],
  Li: [{ name: 'Lila', np: 'लीला', meaning: 'Divine play' }],
  Lu: [{ name: 'Lubhana', np: 'लुभाना', meaning: 'The captivating one' }],
  Le: [{ name: 'Lekhnath', np: 'लेखनाथ', meaning: 'Master of writing' }],
  Lo: [{ name: 'Lokendra', np: 'लोकेन्द्र', meaning: 'Lord of the world' }, { name: 'Lokesh', np: 'लोकेश', meaning: 'Ruler of the world' }],
  A: [{ name: 'Anjali', np: 'अञ्जली', meaning: 'Offering with both hands' }, { name: 'Anil', np: 'अनिल', meaning: 'Wind' }, { name: 'Aarati', np: 'आरती', meaning: 'The lamp offering' }],
  I: [{ name: 'Indira', np: 'इन्दिरा', meaning: 'Laxmi, beauty' }, { name: 'Ishwar', np: 'ईश्वर', meaning: 'God' }],
  U: [{ name: 'Usha', np: 'उषा', meaning: 'Dawn' }, { name: 'Uttam', np: 'उत्तम', meaning: 'The best' }],
  E: [{ name: 'Ekraj', np: 'एकराज', meaning: 'Sole sovereign' }],
  O: [{ name: 'Om', np: 'ॐ', meaning: 'The primordial sound' }, { name: 'Omkar', np: 'ओंकार', meaning: 'The sacred syllable' }],
  Va: [{ name: 'Vasanta', np: 'वसन्त', meaning: 'Spring' }, { name: 'Vandana', np: 'वन्दना', meaning: 'Salutation' }],
  Vi: [{ name: 'Vijaya', np: 'विजया', meaning: 'Victory' }, { name: 'Vishnu', np: 'विष्णु', meaning: 'The preserver' }],
  Vu: [{ name: 'Vuwan', np: 'भुवन', meaning: 'The world' }],
  Ve: [{ name: 'Vedanta', np: 'वेदान्त', meaning: 'End of the Vedas' }],
  Vo: [{ name: 'Vopal', np: 'भोपाल', meaning: 'Protector' }],
  Ka: [{ name: 'Kamala', np: 'कमला', meaning: 'Lotus' }, { name: 'Kailash', np: 'कैलाश', meaning: 'Shiva’s mountain' }],
  Ki: [{ name: 'Kiran', np: 'किरण', meaning: 'Ray of light' }, { name: 'Kirti', np: 'कीर्ति', meaning: 'Fame' }],
  Ku: [{ name: 'Kumar', np: 'कुमार', meaning: 'Youth, prince' }, { name: 'Kusum', np: 'कुसुम', meaning: 'Flower' }],
  Gha: [{ name: 'Ghanashyam', np: 'घनश्याम', meaning: 'Dark as a rain cloud — Krishna' }],
  Nga: [{ name: 'Angira', np: 'अङ्गिरा', meaning: 'A vedic sage' }],
  Chha: [{ name: 'Chhabi', np: 'छबि', meaning: 'Image, radiance' }],
  Ke: [{ name: 'Keshav', np: 'केशव', meaning: 'Krishna, the long-haired' }],
  Ko: [{ name: 'Komal', np: 'कोमल', meaning: 'Tender' }],
  Ha: [{ name: 'Hari', np: 'हरि', meaning: 'Vishnu' }, { name: 'Hasina', np: 'हसिना', meaning: 'The smiling one' }],
  Hi: [{ name: 'Hima', np: 'हिमा', meaning: 'Snow' }, { name: 'Himal', np: 'हिमाल', meaning: 'The snow mountain' }],
  Hu: [{ name: 'Humkar', np: 'हुंकार', meaning: 'The roar' }],
  He: [{ name: 'Hemanta', np: 'हेमन्त', meaning: 'Early winter' }, { name: 'Hema', np: 'हेमा', meaning: 'Gold' }],
  Ho: [{ name: 'Homnath', np: 'होमनाथ', meaning: 'Lord of the fire offering' }],
  Da: [{ name: 'Damodar', np: 'दामोदर', meaning: 'Krishna' }, { name: 'Darshana', np: 'दर्शना', meaning: 'Vision, sight of the divine' }],
  Di: [{ name: 'Dipak', np: 'दीपक', meaning: 'Lamp' }, { name: 'Dipa', np: 'दीपा', meaning: 'Light' }],
  Du: [{ name: 'Durga', np: 'दुर्गा', meaning: 'The invincible goddess' }],
  De: [{ name: 'Devi', np: 'देवी', meaning: 'Goddess' }, { name: 'Dev', np: 'देव', meaning: 'God' }],
  Do: [{ name: 'Dolma', np: 'डोल्मा', meaning: 'Tara, the saviouress' }],
  Ma: [{ name: 'Manisha', np: 'मनीषा', meaning: 'Wisdom' }, { name: 'Mahesh', np: 'महेश', meaning: 'Shiva' }],
  Mi: [{ name: 'Mina', np: 'मीना', meaning: 'Fish, precious stone' }],
  Mu: [{ name: 'Muna', np: 'मुना', meaning: 'Beloved — from Muna Madan' }, { name: 'Mukesh', np: 'मुकेश', meaning: 'Lord of liberation' }],
  Me: [{ name: 'Mekhala', np: 'मेखला', meaning: 'Girdle, mountain slope' }],
  Mo: [{ name: 'Mohan', np: 'मोहन', meaning: 'The enchanting one' }, { name: 'Mohini', np: 'मोहिनी', meaning: 'The enchantress' }],
  Ta: [{ name: 'Tara', np: 'तारा', meaning: 'Star' }, { name: 'Tanuja', np: 'तनुजा', meaning: 'Daughter' }],
  Ti: [{ name: 'Tilak', np: 'तिलक', meaning: 'The mark on the forehead' }],
  Tu: [{ name: 'Tulsi', np: 'तुलसी', meaning: 'The holy basil' }],
  Te: [{ name: 'Tej', np: 'तेज', meaning: 'Radiance' }, { name: 'Tejasvi', np: 'तेजस्वी', meaning: 'Brilliant' }],
  To: [{ name: 'Toran', np: 'तोरण', meaning: 'The festive gateway' }],
  Pa: [{ name: 'Parbati', np: 'पार्वती', meaning: 'Daughter of the mountain' }, { name: 'Padam', np: 'पद्म', meaning: 'Lotus' }],
  Pi: [{ name: 'Pinky', np: 'पिङ्की', meaning: 'A common Nepali given name' }],
  Pu: [{ name: 'Puja', np: 'पूजा', meaning: 'Worship' }, { name: 'Purnima', np: 'पूर्णिमा', meaning: 'Full moon' }],
  Sha: [{ name: 'Shanti', np: 'शान्ति', meaning: 'Peace' }, { name: 'Sharmila', np: 'शर्मिला', meaning: 'Modest' }],
  Na: [{ name: 'Nabin', np: 'नवीन', meaning: 'New' }, { name: 'Nanda', np: 'नन्दा', meaning: 'Joy' }],
  Tha: [{ name: 'Thaneshwar', np: 'थानेश्वर', meaning: 'Lord of the sacred place' }],
  Pe: [{ name: 'Pemba', np: 'पेम्बा', meaning: 'Saturday — a Sherpa name' }],
  Po: [{ name: 'Pooja', np: 'पूजा', meaning: 'Worship' }],
  Ra: [{ name: 'Rajesh', np: 'राजेश', meaning: 'Lord of kings' }, { name: 'Rama', np: 'रमा', meaning: 'Laxmi' }],
  Ri: [{ name: 'Rita', np: 'रीता', meaning: 'The right way' }, { name: 'Rishi', np: 'ऋषि', meaning: 'Sage' }],
  Ru: [{ name: 'Rupa', np: 'रूपा', meaning: 'Form, beauty' }, { name: 'Rudra', np: 'रुद्र', meaning: 'Shiva' }],
  Re: [{ name: 'Rekha', np: 'रेखा', meaning: 'A line, a destiny' }],
  Ro: [{ name: 'Roshan', np: 'रोशन', meaning: 'Bright' }],
  Ni: [{ name: 'Nisha', np: 'निशा', meaning: 'Night' }, { name: 'Nirmal', np: 'निर्मल', meaning: 'Pure' }],
  Nu: [{ name: 'Nutan', np: 'नूतन', meaning: 'New' }],
  Ne: [{ name: 'Netra', np: 'नेत्र', meaning: 'Eye' }],
  No: [{ name: 'Nostalgia', np: 'नोवल', meaning: 'Rare in Nepali; Nowal is used' }],
  Ya: [{ name: 'Yamuna', np: 'यमुना', meaning: 'The river' }, { name: 'Yash', np: 'यश', meaning: 'Fame' }],
  Yi: [{ name: 'Yigyan', np: 'यज्ञ', meaning: 'The fire sacrifice' }],
  Yu: [{ name: 'Yubaraj', np: 'युवराज', meaning: 'Crown prince' }],
  Ye: [{ name: 'Yeshoda', np: 'यशोदा', meaning: 'Krishna’s mother' }],
  Yo: [{ name: 'Yogesh', np: 'योगेश', meaning: 'Master of yoga' }, { name: 'Yogita', np: 'योगिता', meaning: 'One who is united' }],
  Bha: [{ name: 'Bhawana', np: 'भावना', meaning: 'Feeling' }, { name: 'Bharat', np: 'भरत', meaning: 'The sustained one' }],
  Bhi: [{ name: 'Bhim', np: 'भीम', meaning: 'The mighty' }],
  Bhu: [{ name: 'Bhuwan', np: 'भुवन', meaning: 'The world' }, { name: 'Bhumika', np: 'भूमिका', meaning: 'The role, the earth' }],
  Dha: [{ name: 'Dhan', np: 'धन', meaning: 'Wealth' }, { name: 'Dhana', np: 'धना', meaning: 'Prosperous' }],
  Pha: [{ name: 'Phulmaya', np: 'फूलमाया', meaning: 'Flower of love' }],
  Bhe: [{ name: 'Bheshraj', np: 'भेषराज', meaning: 'King of healing' }],
  Bho: [{ name: 'Bhojraj', np: 'भोजराज', meaning: 'The generous king' }],
  Ja: [{ name: 'Jaya', np: 'जया', meaning: 'Victory' }, { name: 'Janak', np: 'जनक', meaning: 'Sita’s father, king of Mithila' }],
  Ji: [{ name: 'Jiban', np: 'जीवन', meaning: 'Life' }],
  Ju: [{ name: 'Juna', np: 'जुना', meaning: 'Moonlight' }],
  Je: [{ name: 'Jenisha', np: 'जेनिशा', meaning: 'A modern Nepali name' }],
  Jo: [{ name: 'Jotsna', np: 'ज्योत्स्ना', meaning: 'Moonlight' }],
  Ga: [{ name: 'Ganesh', np: 'गणेश', meaning: 'Remover of obstacles' }, { name: 'Gaurav', np: 'गौरव', meaning: 'Pride' }],
  Gi: [{ name: 'Gita', np: 'गीता', meaning: 'Song — the Bhagavad Gita' }],
  Gu: [{ name: 'Gunjan', np: 'गुञ्जन', meaning: 'The humming of bees' }],
  Ge: [{ name: 'Gehendra', np: 'गेहेन्द्र', meaning: 'Lord of the home' }],
  Go: [{ name: 'Gopal', np: 'गोपाल', meaning: 'Cowherd — Krishna' }, { name: 'Govinda', np: 'गोविन्द', meaning: 'Krishna' }],
  Sa: [{ name: 'Sarita', np: 'सरिता', meaning: 'River' }, { name: 'Sagar', np: 'सागर', meaning: 'Ocean' }],
  Si: [{ name: 'Sita', np: 'सीता', meaning: 'Ram’s consort' }, { name: 'Simran', np: 'सिमरन', meaning: 'Remembrance' }],
  Su: [{ name: 'Sunita', np: 'सुनीता', meaning: 'Well-conducted' }, { name: 'Suman', np: 'सुमन', meaning: 'Good-hearted, flower' }],
  Se: [{ name: 'Sewa', np: 'सेवा', meaning: 'Service' }],
  So: [{ name: 'Sonam', np: 'सोनाम', meaning: 'The fortunate one' }, { name: 'Sohan', np: 'सोहन', meaning: 'Charming' }],
  Jha: [{ name: 'Jharana', np: 'झरना', meaning: 'Waterfall' }],
  Cha: [{ name: 'Chandra', np: 'चन्द्र', meaning: 'Moon' }, { name: 'Chameli', np: 'चमेली', meaning: 'Jasmine' }],
  Chi: [{ name: 'Chitra', np: 'चित्रा', meaning: 'Picture, the bright one' }],
};

export type NamkaranReading = {
  nakshatra: string;
  np: string;
  pada: number;
  /** The syllable this pada gives. */
  syllable: string;
  /** All four syllables of the nakshatra, so a family can choose. */
  allSyllables: string[];
  suggestions: NameSuggestion[];
  deity: string;
  /** What the ceremony traditionally asks for. */
  ceremony: string;
};

export function namkaranFor(chart: Chart): NamkaranReading {
  const meta = NAKSHATRAS[chart.nakshatra.index];
  const syllable = meta.syllables[chart.pada - 1];

  // Fall back to the nakshatra's other padas if this syllable has no names
  // listed, so the screen is never empty.
  const suggestions =
    NAMES[syllable] ?? meta.syllables.flatMap((s) => NAMES[s] ?? []).slice(0, 3);

  return {
    nakshatra: meta.name,
    np: meta.np,
    pada: chart.pada,
    syllable,
    allSyllables: meta.syllables,
    suggestions,
    deity: meta.deity,
    ceremony:
      'Namkaran is done on the eleventh day, or on a chosen day within the first month. The name is spoken into the child’s right ear by the father, and the family astrologer writes the janma chino the same day.',
  };
}

/** Names for a given syllable, for a parent browsing directly. */
export function namesForSyllable(syllable: string): NameSuggestion[] {
  return NAMES[syllable] ?? [];
}
