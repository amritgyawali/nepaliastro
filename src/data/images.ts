import type { ImageSourcePropType } from 'react-native';

/**
 * Real photographs of real things — a puja thali, a rudraksha stall, Tihar
 * lamps, the Indra Jatra chariot — bundled in `assets/images/` so they load
 * offline and never disappear from a CDN. Every one comes from Wikimedia
 * Commons; `assets/images/CREDITS.md` names each photographer and licence,
 * and a new photo is not added here without a line there.
 */
export type Scene = {
  /** The bundled file. */
  source: ImageSourcePropType;
  /** Read out by a screen reader; says what is in the frame. */
  alt: string;
  /** "Photographer · licence", printed small on the photo. */
  credit: string;
};

export const scenes = {
  pooja: {
    source: require('../../assets/images/remedy-pooja.jpg'),
    alt: 'A puja thali with red tika, flowers and jamara',
    credit: 'Tejaswee.shrestha · CC BY-SA 3.0',
  },
  festivalRitual: {
    source: require('../../assets/images/remedy-festival.jpg'),
    alt: 'A garlanded Ganesh idol at a Ganesh Chaturthi puja',
    credit: 'Ashish Suryavanshi858 · CC0',
  },
  mala: {
    source: require('../../assets/images/remedy-mala.jpg'),
    alt: 'Rudraksha malas hanging at a stall',
    credit: 'Janak Bhatta · CC BY-SA 4.0',
  },
  singingBowl: {
    source: require('../../assets/images/remedy-healing.jpg'),
    alt: 'Singing bowls on a table in Patan, a pagoda behind',
    credit: 'Swarnima Shrestha · CC BY-SA 4.0',
  },
  dashain: {
    source: require('../../assets/images/festival-dashain.jpg'),
    alt: 'Dashain tika and jamara in a bowl',
    credit: 'Neeraj.neupane5 · CC BY-SA 4.0',
  },
  tihar: {
    source: require('../../assets/images/festival-tihar.jpg'),
    alt: 'A woman lighting oil lamps on the floor for Tihar',
    credit: 'Mithunkunwar9 · CC BY-SA 4.0',
  },
  kukurTihar: {
    source: require('../../assets/images/festival-kukur-tihar.jpg'),
    alt: 'Two dogs in marigold garlands on Kukur Tihar',
    credit: 'Ukniw · CC BY-SA 4.0',
  },
  teej: {
    source: require('../../assets/images/festival-teej.jpg'),
    alt: 'Women in red saris dancing at Teej',
    credit: '加德满都两年 · CC BY-SA 2.0',
  },
  indraJatra: {
    source: require('../../assets/images/festival-indra-jatra.jpg'),
    alt: 'The Kumari’s chariot at Basantapur during Indra Jatra',
    credit: 'Ganesh Paudel · CC BY-SA 3.0',
  },
  holi: {
    source: require('../../assets/images/festival-holi.jpg'),
    alt: 'Crowds at Basantapur Durbar Square on Holi',
    credit: 'Nirjal Shrestha · CC BY-SA 3.0',
  },
  chhath: {
    source: require('../../assets/images/festival-chhath.jpg'),
    alt: 'Devotees at the water’s edge in Janakpur for Chhath',
    credit: 'Steffen Gauger · CC BY-SA 3.0',
  },
  shivaratri: {
    source: require('../../assets/images/festival-shivaratri.jpg'),
    alt: 'Crowds at Pashupatinath on Maha Shivaratri',
    credit: 'Bijay Chaurasia · CC BY-SA 4.0',
  },
  buddhaJayanti: {
    source: require('../../assets/images/festival-buddha-jayanti.jpg'),
    alt: 'The Maya Devi temple and Ashoka pillar at Lumbini',
    credit: 'Shadow Ayush · CC BY-SA 4.0',
  },
} satisfies Record<string, Scene>;

/**
 * The photograph for a festival, by the id `festivalsIn` gives it. A
 * festival that belongs to a longer one — Phulpati to Dashain, Bhai Tika to
 * Tihar — shares its photo; one with no photo of its own gets none rather
 * than a stand-in that shows something else.
 */
const FESTIVAL_SCENES: Record<string, Scene> = {
  ghatasthapana: scenes.dashain,
  phulpati: scenes.dashain,
  mahaashtami: scenes.dashain,
  mahanavami: scenes.dashain,
  dashain: scenes.dashain,
  kojagrat: scenes.dashain,
  kagtihar: scenes.tihar,
  kukurtihar: scenes.kukurTihar,
  laxmipuja: scenes.tihar,
  mhapuja: scenes.tihar,
  bhaitika: scenes.tihar,
  teej: scenes.teej,
  rishipanchami: scenes.teej,
  indrajatra: scenes.indraJatra,
  holi: scenes.holi,
  chhath: scenes.chhath,
  shivaratri: scenes.shivaratri,
  buddhajayanti: scenes.buddhaJayanti,
};

export function festivalScene(id: string): Scene | undefined {
  return FESTIVAL_SCENES[id];
}
