import { photos } from './images';

export type Speciality = 'all' | 'tarot' | 'palmistry';

export type Astrologer = {
  id: string;
  name: string;
  photo: string;
  /** Comma-joined skills line, e.g. "Tarot, Vastu". */
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
  /** Free to take a consultation right now; drives the green dot on the rail. */
  online?: boolean;
  specialities: Speciality[];
};

/** Cards in the horizontal rails on the home screen. */
export const featuredAstrologers: Astrologer[] = [
  {
    id: 'dhruvansh',
    name: 'Dhruvansh Ji',
    photo: photos.vinayyv,
    skills: 'Vedic, Numerology',
    languages: 'Hindi',
    experience: 18,
    rate: 1.21,
    orders: '25k+ orders',
    rating: 5,
    verified: true,
    celebrity: true,
    online: true,
    specialities: ['all'],
  },
  {
    id: 'suseela',
    name: 'Suseela',
    photo: photos.vihana,
    skills: 'Vedic, Prashna',
    languages: 'Telugu, Hindi',
    experience: 9,
    rate: 0.4,
    orders: '8k+ orders',
    rating: 5,
    verified: true,
    online: true,
    specialities: ['all'],
  },
  {
    id: 'deeptika',
    name: 'Deeptika',
    photo: photos.vera,
    skills: 'Tarot, Life Coach',
    languages: 'English, Hindi',
    experience: 7,
    rate: 0.4,
    orders: '3k+ orders',
    rating: 4,
    verified: true,
    waitTime: 'wait ~ 5m',
    specialities: ['all', 'tarot'],
  },
];

/** The chat directory listing. */
export const chatAstrologers: Astrologer[] = [
  {
    id: 'vihana',
    name: 'Vihana Ji',
    photo: photos.vihana,
    skills: 'Tarot, Vastu',
    languages: 'English',
    experience: 14,
    rate: 0.49,
    orders: '500+ orders',
    rating: 5,
    verified: true,
    online: true,
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
    online: true,
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
    specialities: ['all', 'tarot'],
  },
];

/** The call directory listing. */
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
    online: true,
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
    specialities: ['all', 'palmistry'],
  },
];

/**
 * The single best-rated astrologer available near the user.
 *
 * Powers the "1 minute free chat" offer shown as soon as onboarding has the
 * birth date and time, so the pick is deterministic rather than random.
 */
export const topNearbyAstrologer = {
  ...chatAstrologers
    .sort(
      (a, b) =>
        (b.rating ?? 0) - (a.rating ?? 0) || (b.experience ?? 0) - (a.experience ?? 0),
    )[0],
  /** Shown on the offer card as the "near you" proof line. */
  city: 'Kathmandu',
  distance: '2.4 km away',
};

/** The consultation already running, offered at the top of both directories. */
export const ongoingSession = {
  id: 'kiran',
  name: 'Kiran Ji',
  photo: photos.kiran,
  portrait: photos.kiran,
  status: 'Chat in progress',
  verified: true,
};

export function findAstrologer(id: string): Astrologer | undefined {
  return [...chatAstrologers, ...callAstrologers, ...featuredAstrologers].find(
    (a) => a.id === id,
  );
}
