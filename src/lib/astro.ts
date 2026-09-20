/**
 * Small astrology helpers used by the home screen.
 *
 * Everything here is pure and deterministic: the "daily" numbers are derived
 * from the date and the sign, so the card shows the same reading all day and
 * a different one tomorrow, without a backend and without storing anything.
 */

export type ZodiacSign = {
  id: string;
  name: string;
  /** Unicode glyph, e.g. ♈ for Aries. */
  glyph: string;
  element: 'Fire' | 'Earth' | 'Air' | 'Water';
  /** Inclusive start of the sign as [month, day], month 1-12. */
  from: [number, number];
  to: [number, number];
};

export const zodiacSigns: ZodiacSign[] = [
  { id: 'aries', name: 'Aries', glyph: '♈', element: 'Fire', from: [3, 21], to: [4, 19] },
  { id: 'taurus', name: 'Taurus', glyph: '♉', element: 'Earth', from: [4, 20], to: [5, 20] },
  { id: 'gemini', name: 'Gemini', glyph: '♊', element: 'Air', from: [5, 21], to: [6, 20] },
  { id: 'cancer', name: 'Cancer', glyph: '♋', element: 'Water', from: [6, 21], to: [7, 22] },
  { id: 'leo', name: 'Leo', glyph: '♌', element: 'Fire', from: [7, 23], to: [8, 22] },
  { id: 'virgo', name: 'Virgo', glyph: '♍', element: 'Earth', from: [8, 23], to: [9, 22] },
  { id: 'libra', name: 'Libra', glyph: '♎', element: 'Air', from: [9, 23], to: [10, 22] },
  { id: 'scorpio', name: 'Scorpio', glyph: '♏', element: 'Water', from: [10, 23], to: [11, 21] },
  { id: 'sagittarius', name: 'Sagittarius', glyph: '♐', element: 'Fire', from: [11, 22], to: [12, 21] },
  { id: 'capricorn', name: 'Capricorn', glyph: '♑', element: 'Earth', from: [12, 22], to: [1, 19] },
  { id: 'aquarius', name: 'Aquarius', glyph: '♒', element: 'Air', from: [1, 20], to: [2, 18] },
  { id: 'pisces', name: 'Pisces', glyph: '♓', element: 'Water', from: [2, 19], to: [3, 20] },
];

/** The sign a birth date falls in; Aries when the date is unknown. */
export function signForDate(birth: { day: number; month: number } | null): ZodiacSign {
  if (!birth) return zodiacSigns[0];
  const { day, month } = birth;

  const match = zodiacSigns.find((sign) => {
    const [fromMonth, fromDay] = sign.from;
    const [toMonth, toDay] = sign.to;
    // Capricorn wraps the year end, so its range is tested as two halves.
    if (fromMonth > toMonth) {
      return (
        (month === fromMonth && day >= fromDay) || (month === toMonth && day <= toDay)
      );
    }
    return (
      (month === fromMonth && day >= fromDay) ||
      (month === toMonth && day <= toDay) ||
      (month > fromMonth && month < toMonth)
    );
  });

  return match ?? zodiacSigns[0];
}

/** "Sun 20 Sep" — the date line under the greeting. */
export function formatToday(date = new Date()): string {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];
  return `${days[date.getDay()]} ${date.getDate()} ${months[date.getMonth()]}`;
}

/** Time-of-day greeting, in the register the rest of the copy uses. */
export function greetingFor(date = new Date()): string {
  const hour = date.getHours();
  if (hour < 5) return 'Still awake';
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  if (hour < 21) return 'Good evening';
  return 'Good night';
}

/** YYYY-MM-DD, used as the seed for the day's reading. */
export function dayKey(date = new Date()): string {
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

/** FNV-1a: a short, stable string hash. */
function hash(input: string): number {
  let value = 0x811c9dc5;
  for (let i = 0; i < input.length; i += 1) {
    value ^= input.charCodeAt(i);
    value = Math.imul(value, 0x01000193);
  }
  return value >>> 0;
}

/**
 * A value in [min, max] that depends only on the seed, so the same sign on
 * the same day always reads the same.
 */
export function seededRange(seed: string, min: number, max: number): number {
  const span = max - min + 1;
  return min + (hash(seed) % span);
}

export function seededPick<T>(seed: string, items: readonly T[]): T {
  return items[hash(seed) % items.length];
}

/* ------------------------------------------------------------------ *
 * The day's reading
 * ------------------------------------------------------------------ */

export type LuckyColour = { name: string; hex: string };

export type DailyReading = {
  sign: ZodiacSign;
  /** One-line verdict, e.g. "A good day to ask for what you want". */
  headline: string;
  /** Two sentences of detail, revealed when the card is expanded. */
  body: string;
  luckyNumber: number;
  luckyColour: LuckyColour;
};

const HEADLINES = [
  'A good day to ask for what you want',
  'Move slowly and the day moves with you',
  'Something you have been waiting on finally shifts',
  'Say the thing you have been rehearsing',
  'Money matters settle more easily than expected',
  'Keep the afternoon free — plans will change',
  'An old contact turns out to be the useful one',
  'Rest counts as progress today',
] as const;

const BODIES = [
  'The morning favours conversations you have been putting off, so start there rather than with your inbox. After sunset, keep commitments light — you will want the evening back.',
  'Work that needs patience goes further than work that needs speed. If a decision can wait a day without cost, let it wait.',
  'Money and paperwork are well placed, so file, pay or ask today rather than next week. Avoid lending to someone who has not repaid you before.',
  'Family brings one small demand you did not plan for. Handle it early and the rest of the day stays yours.',
  'Your instinct about a person is the accurate one, even if you cannot explain it yet. Do not argue yourself out of it.',
  'Travel and short journeys go smoothly; long negotiations do not. Split the difference by agreeing the principle now and the detail later.',
  'A quiet start pays off — the useful opening arrives after midday. Keep some energy in reserve for it.',
  'Health responds to routine more than effort today. Water, an early night, and a walk you actually take beat any ambitious plan.',
] as const;

/**
 * Lucky colours, drawn from the palette the rest of the app already uses so
 * the swatch never introduces a colour that appears nowhere else.
 */
const LUCKY_COLOURS: LuckyColour[] = [
  { name: 'Saffron', hex: '#FF9933' },
  { name: 'Emerald', hex: '#1F7A46' },
  { name: 'Vermilion', hex: '#C03F2C' },
  { name: 'Indigo', hex: '#2F3E8F' },
  { name: 'Brass', hex: '#B08034' },
  { name: 'Sandal', hex: '#6B5A46' },
];

/**
 * The reading for one sign on one day.
 *
 * Every value is derived from `<date>:<sign>` through the seeded helpers
 * above, so the card is stable for the whole day, differs per sign, and needs
 * no network call or stored state.
 */
export function readingFor(sign: ZodiacSign, date = new Date()): DailyReading {
  const seed = `${dayKey(date)}:${sign.id}`;

  return {
    sign,
    headline: seededPick(`${seed}:headline`, HEADLINES),
    body: seededPick(`${seed}:body`, BODIES),
    luckyNumber: seededRange(`${seed}:number`, 1, 9),
    luckyColour: seededPick(`${seed}:colour`, LUCKY_COLOURS),
  };
}
