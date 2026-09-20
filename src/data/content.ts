import { photos } from './images';

/** The five yellow circles under the home search field. */
export const quickCategories = [
  { id: 'daily-horoscope', label: 'Daily\nHoroscope', icon: 'sunrise' },
  { id: 'free-kundli', label: 'Free\nKundli', icon: 'kundli' },
  { id: 'gemstones', label: 'Gemstones', icon: 'gem' },
  { id: 'kundli-matching', label: 'Kundli\nMatching', icon: 'rings' },
  { id: 'astrology-blog', label: 'Astrology\nBlog', icon: 'blog' },
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

/** Counters in the ribbon under the AstroRemedy hero. */
export const remedyStats = [
  { value: '4,52,279', label: 'ORDERS' },
  { value: '4.72', label: 'RATING', star: true },
  { value: '7,881', label: 'EXPERTS' },
  { value: '1,854', label: 'IN SESSION' },
];

/** The 2-up picture grid on the AstroRemedy tab. */
export const remedyServices = [
  { id: 'ganesh', title: 'Ganesh Chaturthi\nSpecial 2026', image: photos.ganesh, tint: '#B87D39' },
  { id: 'pooja', title: 'Pooja', image: photos.pooja, tint: '#A16226', trending: true },
  { id: 'spells', title: 'Special Spells', image: photos.spells, tint: '#433852' },
  { id: 'healings', title: 'Special\nHealings', image: photos.healings, tint: '#59395E' },
];

/** Feature marks inside the Rudraksha hero banner. */
export const remedyHeroFeatures = [
  { id: 'protection', label: 'Energy Protection', icon: 'shield' },
  { id: 'calm', label: 'Calm & Stability', icon: 'meditate' },
  { id: 'grounding', label: 'Grounding & Strength', icon: 'grounding' },
] as const;

/** Grouped rows on Profile & Settings. */
export const profileGroups = [
  {
    title: 'EXPLORE',
    items: [
      { id: 'chat-astrologer', label: 'Chat with Astrologer', icon: 'message', href: '/(tabs)/chat' },
      { id: 'home', label: 'Home', icon: 'home', href: '/(tabs)' },
      { id: 'free-services', label: 'Free Services', icon: 'grid' },
      { id: 'book-pooja', label: 'Book a Pooja', icon: 'lotus', href: '/(tabs)/remedies' },
      { id: 'gemstone', label: 'Gemstone', icon: 'gem' },
    ],
  },
  {
    title: 'ACCOUNT',
    items: [
      { id: 'my-following', label: 'My following', icon: 'users' },
      { id: 'assistant-chat', label: 'Assistant Chat', icon: 'headphones' },
      { id: 'redeem-gift-card', label: 'Redeem Gift Card', icon: 'gift' },
    ],
  },
] as const;

/** Tap-to-send prompts above the chat composer. */
export const quickPrompts = [
  '🎓 Will I study abroad?',
  '💼 Best career field for me?',
  '🪐 Any remedies for peace?',
  '❤️ Love & Marriage timing',
];

/** Canned astrologer replies for the demo chat. */
export const astroReplies = [
  'I see a powerful alignment of Mercury and Venus in your horoscope. This indicates excellent communication skills and success in analytical or technical domains.',
  'Your Rahu placement advises patience before taking sudden leaps this quarter. Chanting the Gayatri mantra on Wednesdays will bring mental clarity.',
  'Yes, foreign travel and relocation are clearly indicated in your 12th house between September and November. Prepare your documents systematically.',
  'A very positive transit is initiating next month! Wear more brass, copper, or warm tones to strengthen your ruling planet Sun.',
  'Regarding your query: The alignment suggests stability. Do not worry about minor delays, as Saturn teaches long-term resilience.',
];
