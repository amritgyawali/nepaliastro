import { photos } from './images';

/** The four shortcuts under the home search field. */
export const quickCategories = [
  { id: 'daily-horoscope', label: 'Horoscope', icon: 'sunrise' },
  { id: 'free-kundli', label: 'Kundli', icon: 'kundli' },
  { id: 'kundli-matching', label: 'Matching', icon: 'rings' },
  { id: 'remedies', label: 'Remedies', icon: 'gem' },
] as const;

export type QuickCategory = (typeof quickCategories)[number];

/** Filter chips on both astrologer directories. */
export const directoryFilters = [
  { id: 'all', label: 'All' },
  { id: 'tarot', label: 'Tarot' },
  { id: 'palmistry', label: 'Palmistry' },
] as const;

/** The languages grid on the last onboarding step. */
export const languageOptions = [
  'English',
  'Hindi',
  'Bengali',
  'Gujarati',
  'Kannada',
  'Malayalam',
  'Marathi',
  'Punjabi',
  'Tamil',
  'Telugu',
  'Urdu',
  'Nepali',
];

/** The 2-up picture grid on the AstroRemedy tab. */
export const remedyServices = [
  {
    id: 'pooja',
    title: 'Book a Pooja',
    description: 'A priest performs it in your name and sends the recording.',
    image: photos.pooja,
  },
  {
    id: 'ganesh',
    title: 'Festival specials',
    description: 'Ganesh Chaturthi and Dashain rituals, arranged end to end.',
    image: photos.ganesh,
  },
  {
    id: 'spells',
    title: 'Gemstones & malas',
    description: 'Rudraksha and stones chosen for your chart, not for a trend.',
    image: photos.spells,
  },
  {
    id: 'healings',
    title: 'Healing sessions',
    description: 'One-to-one sessions for grounding, calm and protection.',
    image: photos.healings,
  },
];

/** Grouped rows on Profile & Settings. Every row goes somewhere. */
export const profileGroups = [
  {
    title: 'Consult',
    items: [
      { id: 'chat-astrologer', label: 'Chat with an astrologer', icon: 'message', href: '/(tabs)/chat' },
      { id: 'call-astrologer', label: 'Call an astrologer', icon: 'headphones', href: '/(tabs)/call' },
      { id: 'remedies', label: 'Remedies & poojas', icon: 'lotus', href: '/(tabs)/remedies' },
    ],
  },
  {
    title: 'Your details',
    items: [
      { id: 'birth-details', label: 'Name, gender & birth details', icon: 'calendar', href: '/onboarding/name' },
      { id: 'languages', label: 'Languages you read in', icon: 'message', href: '/onboarding/languages' },
    ],
  },
] as const;

/** Tap-to-send prompts above the chat composer. */
export const quickPrompts = [
  'Will I study abroad?',
  'Which career suits my chart?',
  'Any remedy for peace of mind?',
  'When is a good time to marry?',
];

/** Canned astrologer replies for the demo chat. */
export const astroReplies = [
  'I see a powerful alignment of Mercury and Venus in your horoscope. This indicates excellent communication skills and success in analytical or technical domains.',
  'Your Rahu placement advises patience before taking sudden leaps this quarter. Chanting the Gayatri mantra on Wednesdays will bring mental clarity.',
  'Yes, foreign travel and relocation are clearly indicated in your 12th house between September and November. Prepare your documents systematically.',
  'A very positive transit is initiating next month! Wear more brass, copper, or warm tones to strengthen your ruling planet Sun.',
  'Regarding your query: The alignment suggests stability. Do not worry about minor delays, as Saturn teaches long-term resilience.',
];
