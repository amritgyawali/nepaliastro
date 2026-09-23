/**
 * The service catalogue.
 *
 * Twenty services, in four groups that match how people ask for them rather
 * than how the engine is organised: the things checked daily, the readings
 * taken from a birth chart, the questions about timing, and the remedies.
 */
export type ServiceGroup = 'daily' | 'chart' | 'timing' | 'remedy';

export type Service = {
  id: string;
  /** Route to push. */
  href: string;
  name: string;
  np: string;
  /** One line, in the words a user would use. */
  tagline: string;
  icon: ServiceIcon;
  group: ServiceGroup;
  /** Needs the birth date, and says so before opening. */
  needsBirth?: boolean;
  /** Needs the birth time too, which not everyone has. */
  needsTime?: boolean;
  /** A short word on the card — "New", "Popular" — set in the dashboard. */
  badge?: string;
};

export type ServiceIcon =
  | 'sunrise' | 'grid' | 'swap' | 'star' | 'kundli' | 'dasha' | 'rings'
  | 'shield' | 'clock' | 'calendar' | 'palette' | 'numerals' | 'gem'
  | 'baby' | 'orbit' | 'question' | 'compass' | 'lotus' | 'sparkle' | 'praying';

export const SERVICE_GROUPS: { id: ServiceGroup; title: string; np: string }[] = [
  { id: 'daily', title: 'Every day', np: 'दैनिक' },
  { id: 'chart', title: 'Your chart', np: 'तपाईंको चिना' },
  { id: 'timing', title: 'Choosing a time', np: 'साइत' },
  { id: 'remedy', title: 'Remedies and guidance', np: 'उपाय' },
];

export const SERVICES: Service[] = [
  /* Every day -------------------------------------------------------- */
  {
    id: 'rashifal', href: '/horoscope', name: 'Rashifal', np: 'राशिफल',
    tagline: 'Today, this week, this month and the year',
    icon: 'star', group: 'daily',
  },
  {
    id: 'panchang', href: '/panchang', name: 'Panchang', np: 'पञ्चाङ्ग',
    tagline: 'Tithi, nakshatra, yoga, karana — and when each ends',
    icon: 'sunrise', group: 'daily',
  },
  {
    id: 'patro', href: '/patro', name: 'Nepali Patro', np: 'नेपाली पात्रो',
    tagline: 'The Bikram Sambat calendar, month by month',
    icon: 'grid', group: 'daily',
  },
  {
    id: 'converter', href: '/date-converter', name: 'Date converter', np: 'मिति परिवर्तन',
    tagline: 'BS to AD, AD to BS, and Nepal Sambat',
    icon: 'swap', group: 'daily',
  },
  {
    id: 'lucky', href: '/lucky', name: 'Lucky colour and number', np: 'शुभ रङ र अङ्क',
    tagline: 'What to wear today, and which number favours you',
    icon: 'palette', group: 'daily',
  },
  {
    id: 'festivals', href: '/festivals', name: 'Festivals and tika sait', np: 'चाडपर्व',
    tagline: 'Dashain, Tihar and the whole year, with tika timings',
    icon: 'calendar', group: 'daily',
  },

  /* Your chart -------------------------------------------------------- */
  {
    id: 'kundli', href: '/kundli', name: 'Janma Kundali', np: 'जन्म कुण्डली',
    tagline: 'Your birth chart, the nine grahas and twelve houses',
    icon: 'kundli', group: 'chart', needsBirth: true, needsTime: true,
  },
  {
    id: 'dasha', href: '/dasha', name: 'Graha Dasha', np: 'ग्रह दशा',
    tagline: 'Which period is running, and when the next one begins',
    icon: 'dasha', group: 'chart', needsBirth: true,
  },
  {
    id: 'dosha', href: '/dosha', name: 'Dosha check', np: 'दोष जाँच',
    tagline: 'Manglik, Kaal Sarp, Sade Sati, Gandmool and Pitru',
    icon: 'shield', group: 'chart', needsBirth: true,
  },
  {
    id: 'matching', href: '/matching', name: 'Kundali Milan', np: 'कुण्डली मिलान',
    tagline: 'The eight koots, out of thirty-six gunas',
    icon: 'rings', group: 'chart', needsBirth: true,
  },
  {
    id: 'transit', href: '/transit', name: 'Gochar transits', np: 'गोचर',
    tagline: 'Where the grahas are now, counted from your moon',
    icon: 'orbit', group: 'chart', needsBirth: true,
  },
  {
    id: 'varshaphal', href: '/varshaphal', name: 'Varshaphal', np: 'वर्षफल',
    tagline: 'The year ahead, from your solar return',
    icon: 'sparkle', group: 'chart', needsBirth: true, needsTime: true,
  },
  {
    id: 'numerology', href: '/numerology', name: 'Ank Jyotish', np: 'अङ्क ज्योतिष',
    tagline: 'Mulank, bhagyank and the Lo Shu grid',
    icon: 'numerals', group: 'chart', needsBirth: true,
  },

  /* Choosing a time ---------------------------------------------------- */
  {
    id: 'muhurta', href: '/muhurta', name: 'Shubha Sait', np: 'शुभ साइत',
    tagline: 'The right day for a marriage, a shop, a journey',
    icon: 'clock', group: 'timing',
  },
  {
    id: 'lagna', href: '/lagna', name: 'Shubha Lagna', np: 'शुभ लग्न',
    tagline: 'Which lagna is rising, hour by hour',
    icon: 'orbit', group: 'timing',
  },
  {
    id: 'prashna', href: '/prashna', name: 'Prashna', np: 'प्रश्न ज्योतिष',
    tagline: 'One question, answered from the moment you ask — no birth time needed',
    icon: 'question', group: 'timing',
  },

  /* Remedies ----------------------------------------------------------- */
  {
    id: 'gemstone', href: '/gemstone', name: 'Ratna and Rudraksha', np: 'रत्न सुझाव',
    tagline: 'Which stone suits your chart — and which to avoid',
    icon: 'gem', group: 'remedy', needsBirth: true, needsTime: true,
  },
  {
    id: 'naming', href: '/naming', name: 'Namkaran', np: 'नामकरण',
    tagline: 'The syllable a newborn’s name should start with',
    icon: 'baby', group: 'remedy', needsBirth: true,
  },
  {
    id: 'vastu', href: '/vastu', name: 'Vastu', np: 'वास्तु',
    tagline: 'Room by room, and the direction that favours you',
    icon: 'compass', group: 'remedy',
  },
  {
    id: 'remedies', href: '/(tabs)/remedies', name: 'Puja and remedies', np: 'पूजा र उपाय',
    tagline: 'Grah shanti, and what each one is actually for',
    icon: 'praying', group: 'remedy',
  },
];

export function servicesInGroup(group: ServiceGroup): Service[] {
  return SERVICES.filter((s) => s.group === group);
}

export function serviceById(id: string): Service | undefined {
  return SERVICES.find((s) => s.id === id);
}

/** Free-text search across name, Nepali name and tagline. */
export function searchServices(query: string): Service[] {
  const needle = query.trim().toLowerCase();
  if (!needle) return [];
  return SERVICES.filter(
    (s) =>
      s.name.toLowerCase().includes(needle) ||
      s.np.includes(needle) ||
      s.tagline.toLowerCase().includes(needle),
  );
}
