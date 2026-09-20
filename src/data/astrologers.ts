import { photos } from './images';

export type Speciality = 'all' | 'tarot' | 'palmistry';

export type Astrologer = {
  id: string;
  name: string;
  photo: string;
  /** Comma-joined skills line, e.g. "Tarot, AI Astrologer". */
  skills: string;
  /** Comma-joined languages line, e.g. "English, Hindi, Marathi". */
  languages: string;
  /** Years of experience; omitted for the partially-scrolled cards. */
  experience?: number;
  /** Price per minute in USD. */
  rate: number;
  /** Discounted rate — when present the original `rate` is struck through. */
  discountedRate?: number;
  /** Order-count label exactly as printed in the design, e.g. "50k+ orders". */
  orders?: string;
  rating?: number;
  verified: boolean;
  celebrity?: boolean;
  /** Queue label for the call directory, e.g. "wait ~ 2m". */
  waitTime?: string;
  /**
   * Renders the condensed card — name, skills and languages only. The designs
   * use this for the third card in each directory, which the live-session
   * banner overlaps.
   */
  preview?: boolean;
  specialities: Speciality[];
};

/** Cards in the horizontal "Astrologers" rail on the home screen. */
export const featuredAstrologers: Astrologer[] = [
  {
    id: 'dhruvansh',
    name: 'Dhruvansh Ji',
    photo: photos.vinayyv,
    skills: 'Vedic, Numerology',
    languages: 'Hindi',
    rate: 1.21,
    verified: true,
    celebrity: true,
    specialities: ['all'],
  },
  {
    id: 'suseela',
    name: 'Suseela',
    photo: photos.vihana,
    skills: 'Vedic, Prashna',
    languages: 'Telugu, Hindi',
    rate: 0.4,
    verified: true,
    specialities: ['all'],
  },
  {
    id: 'deeptika',
    name: 'Deeptika',
    photo: photos.vera,
    skills: 'Tarot, Life Coach',
    languages: 'English, Hindi',
    rate: 0.4,
    verified: true,
    specialities: ['all', 'tarot'],
  },
];

/** The chat directory listing (design/astrologer_directory_home). */
export const chatAstrologers: Astrologer[] = [
  {
    id: 'vihana',
    name: 'Vihana Ji',
    photo: photos.vihana,
    skills: 'Tarot, AI Astrologer',
    languages: 'English',
    experience: 14,
    rate: 0.49,
    orders: '500+ orders',
    rating: 5,
    verified: true,
    specialities: ['all', 'tarot'],
  },
  {
    id: 'vinayyv',
    name: 'VinayyV',
    photo: photos.vinayyv,
    skills: 'Vedic, Face Reading, Life Coach',
    languages: 'Hindi',
    experience: 6,
    rate: 0.49,
    orders: '50k+ orders',
    rating: 5,
    verified: true,
    specialities: ['all', 'palmistry'],
  },
  {
    id: 'vera',
    name: 'Vera',
    photo: photos.vera,
    skills: 'Tarot, Psychic, Life Coach',
    languages: 'English, Hindi, Marathi',
    rate: 0.49,
    verified: true,
    preview: true,
    specialities: ['all', 'tarot'],
  },
];

/** The call directory listing (design/astrologer_directory_call). */
export const callAstrologers: Astrologer[] = [
  {
    id: 'kailash',
    name: 'Kailash',
    photo: photos.vinayyv,
    skills: 'Vedic, Nadi, Numerology',
    languages: 'Hindi, Bengali, Sanskrit',
    experience: 21,
    rate: 0.49,
    orders: '10k+ orders',
    rating: 5,
    verified: true,
    celebrity: true,
    waitTime: 'wait ~ 2m',
    specialities: ['all'],
  },
  {
    id: 'monishka',
    name: 'Monishka',
    photo: photos.vera,
    skills: 'Tarot, Numerology, Vedic',
    languages: 'Hindi',
    experience: 5,
    rate: 0.49,
    discountedRate: 0.25,
    orders: '10k+ orders',
    rating: 5,
    verified: true,
    celebrity: true,
    waitTime: 'wait ~ 4m',
    specialities: ['all', 'tarot'],
  },
  {
    id: 'vinayyv-call',
    name: 'VinayyV',
    photo: photos.vinayyv,
    skills: 'Vedic, Face Reading, Life Coach',
    languages: 'Hindi',
    rate: 0.49,
    verified: true,
    preview: true,
    specialities: ['all', 'palmistry'],
  },
];

/** The live consultation docked above the tab bar on both directories. */
export const ongoingSession = {
  id: 'kiran',
  name: 'Kiran Ji',
  photo: photos.kiran,
  portrait: photos.kiran,
  rate: 0,
  mode: 'CHAT' as const,
  status: 'Chat is in progress',
  verified: true,
};

export function findAstrologer(id: string): Astrologer | undefined {
  return [...chatAstrologers, ...callAstrologers, ...featuredAstrologers].find(
    (a) => a.id === id,
  );
}
