import type { ImageSourcePropType } from 'react-native';

/**
 * Portraits for the astrologer listings.
 *
 * These are served from Google's CDN and are not guaranteed to live forever,
 * so every portrait goes through `<Avatar />`, which falls back to initials
 * if a fetch fails. To ship fully offline, download these into `assets/` and
 * swap the values here for `require()` calls; nothing else changes.
 */
const CDN = 'https://lh3.googleusercontent.com/aida-public/';

export const photos = {
  vihana:
    CDN +
    'AB6AXuCRcZL5MwBdtb2TQnpgqOpvw72SpmmkKYWcwv50IEYhpEEqztQ3uDe90JbV6jMeblqQM87ureR30AWSb8XVfcsFEXc0H_4HGJ946_s_JD4xTLirFfAn2WUDm_2Tp3McSzqlx6r1Jx9brTM4IPPKPWpRR5H6s5LXx_n74AnEjcWnj7TqW2XGN3V6dpBdsteu423rIwQA9CVcOYTOnfjJEHjOkEZlmdX2tqOZ260ydJhZ3x6P0wCPynokhA',
  vinayyv:
    CDN +
    'AB6AXuDMbxkTY32HLIURHDFCMvWGgBQdZxtDhQ67pwlF9MRqiDSJ7jSTrIZDSQO201fN-bfrpNHUQ1DZljrMfTRWhBlKPNupX9K4aSWAcgaAkE1Gq7Gmp0YtAUMd_radweFlpPh3IPIDoU2KwlmZ8hEmP4URNODGjaioAZWYEBRK_XAvflt9tsHfPf8RBDzYHyiFifDU6mz3t8pqgmzj9JUFTZFV2GLAfCEaRy4kemS_kmjqgADeSyGTLsWgXQ',
  vera:
    CDN +
    'AB6AXuDgF9Sniap1KKyp0C6whtXWD22sqUORBZbk_n2oJJWXLXSXbYFRhSxKonxzT-rmwrfc7H3paDcvBipIvXG8mTwk7cLCwHbVmb3Nb1b7BN5S86TMA9wCWTHfPyXPMbtVrJhKsokx53A3sVf2Ye8VN4I_L2bJwuAjaUgIiZL1FxXkrdhZj4B0hMEkaLjMXH1gAGBrTR9BR2MbH57bwZH8WooAx6_RIYbr_FHKVjid6u1zX-xH5gq5SjG8_A',
  kiran:
    CDN +
    'AB6AXuBBzbAGGZXERZxq-BEfPx2mSuE4eypgb-13sH14W7ZUoX2Yn_YHpmK4Igh2dUpHivMaEcZGlWBv86n3z7Wd2PmQA3N3DLNXnvIa3Fn7CuCVY2i8hy2WpgeWQqcRyNYh9xUu5S0REzDi95mSKCLoPZbQhT8qaB6Bcw3HRetYBmm25GdmUENOGvwn2k00Agy8HkYPQeLza-oDzVbsJHipfqjohBYdfmOEoqThAR6KLcqJb1BfCtyzLswMqA',
  ganesh:
    CDN +
    'AB6AXuA1lKzDLo3wCqWQwffLlG5ZifDVL_-SY-ciBJ04WTYV8APVjyFlo1zeqX2im2fbYKBf80W9VfnDbH7wTa-y96Z9vvi1reLy85f-OvnnnPQEIBsJ1d0f_melrRw3msMNKeEp_w3KCFS9RZgu1uDbKk5uNtEYyA34mrj9N9fR8k24ZtOouyI5IjUHAUIbOKUeW-JcUAAI0Q93C2USwr6LWk7CIx6ElFnxgazFA7Hfkq_Q',
} as const;

export type PhotoKey = keyof typeof photos;

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
