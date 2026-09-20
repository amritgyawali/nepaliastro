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
