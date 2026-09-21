/**
 * Time, as Nepal keeps it.
 *
 * Nepal runs on a single offset, +05:45, all year — no daylight saving, no
 * regional zones. That one fact removes an entire class of bug from an
 * astrology app, where a chart drawn an hour out is simply a different chart,
 * so every conversion in this file goes through the same constant.
 */

/** Nepal Standard Time, in minutes east of UTC. */
export const NPT_OFFSET_MINUTES = 345;

const MS_PER_MINUTE = 60_000;
const MS_PER_DAY = 86_400_000;

/** Wall-clock parts of an instant, read in Nepal time. */
export type NepaliClock = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
  /** 0 = Sunday, matching the vara order the panchang uses. */
  weekday: number;
};

/**
 * Nepal wall-clock parts of an instant.
 *
 * Shifting into the offset and then reading the UTC fields gives Nepal's
 * clock on any device, whatever zone the phone itself is set to — which
 * matters, because a user in Doha or Kuala Lumpur still wants Kathmandu's
 * panchang.
 */
export function nepaliClock(at: Date): NepaliClock {
  const shifted = new Date(at.getTime() + NPT_OFFSET_MINUTES * MS_PER_MINUTE);
  return {
    year: shifted.getUTCFullYear(),
    month: shifted.getUTCMonth() + 1,
    day: shifted.getUTCDate(),
    hour: shifted.getUTCHours(),
    minute: shifted.getUTCMinutes(),
    second: shifted.getUTCSeconds(),
    weekday: shifted.getUTCDay(),
  };
}

/** The instant at which Nepal's clock reads the given wall-clock time. */
export function fromNepaliClock(
  year: number,
  month: number,
  day: number,
  hour = 0,
  minute = 0,
  second = 0,
): Date {
  return new Date(
    Date.UTC(year, month - 1, day, hour, minute, second) -
      NPT_OFFSET_MINUTES * MS_PER_MINUTE,
  );
}

/** Midnight in Nepal at the start of the day `at` falls on. */
export function startOfNepaliDay(at: Date): Date {
  const clock = nepaliClock(at);
  return fromNepaliClock(clock.year, clock.month, clock.day);
}

/** `at` moved by whole days, keeping the same Nepal wall-clock time. */
export function addDays(at: Date, days: number): Date {
  return new Date(at.getTime() + days * MS_PER_DAY);
}

export function addMinutes(at: Date, minutes: number): Date {
  return new Date(at.getTime() + minutes * MS_PER_MINUTE);
}

/** Whole days between two instants, counted in Nepal days. */
export function daysBetween(from: Date, to: Date): number {
  return Math.round(
    (startOfNepaliDay(to).getTime() - startOfNepaliDay(from).getTime()) / MS_PER_DAY,
  );
}

/** Same Nepal calendar day? */
export function isSameNepaliDay(a: Date, b: Date): boolean {
  return startOfNepaliDay(a).getTime() === startOfNepaliDay(b).getTime();
}

/* ------------------------------------------------------------------ *
 * Formatting
 * ------------------------------------------------------------------ */

/** "6:42 AM" in Nepal time. */
export function formatClock(at: Date): string {
  const { hour, minute } = nepaliClock(at);
  const period = hour >= 12 ? 'PM' : 'AM';
  return `${hour % 12 || 12}:${`${minute}`.padStart(2, '0')} ${period}`;
}

/** "06:42" in Nepal time — for tables, where a 24-hour column lines up. */
export function formatClock24(at: Date): string {
  const { hour, minute } = nepaliClock(at);
  return `${`${hour}`.padStart(2, '0')}:${`${minute}`.padStart(2, '0')}`;
}

/** "6:42 AM, 21 Sep" — a time that may not be today. */
export function formatClockWithDay(at: Date, today = new Date()): string {
  const time = formatClock(at);
  if (isSameNepaliDay(at, today)) return time;
  const { day, month } = nepaliClock(at);
  return `${time}, ${day} ${GREGORIAN_MONTHS_SHORT[month - 1]}`;
}

/** "2h 14m", or "14m" under the hour. Negative spans read as "0m". */
export function formatDuration(minutes: number): string {
  const total = Math.max(0, Math.round(minutes));
  const hours = Math.floor(total / 60);
  const rest = total % 60;
  if (hours === 0) return `${rest}m`;
  if (rest === 0) return `${hours}h`;
  return `${hours}h ${rest}m`;
}

export const GREGORIAN_MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
] as const;

export const GREGORIAN_MONTHS_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
] as const;

/** Vara — the weekday, in the order Sunday..Saturday the panchang uses. */
export const VARA = [
  { en: 'Sunday', np: 'आइतबार', lord: 'Sun' },
  { en: 'Monday', np: 'सोमबार', lord: 'Moon' },
  { en: 'Tuesday', np: 'मङ्गलबार', lord: 'Mars' },
  { en: 'Wednesday', np: 'बुधबार', lord: 'Mercury' },
  { en: 'Thursday', np: 'बिहीबार', lord: 'Jupiter' },
  { en: 'Friday', np: 'शुक्रबार', lord: 'Venus' },
  { en: 'Saturday', np: 'शनिबार', lord: 'Saturn' },
] as const;

/** "21 September 2026". */
export function formatGregorian(at: Date): string {
  const { year, month, day } = nepaliClock(at);
  return `${day} ${GREGORIAN_MONTHS[month - 1]} ${year}`;
}

/** "Sun 21 Sep" — the day, short enough to sit beside a heading. */
export function formatShortDay(at: Date): string {
  const { day, month, weekday } = nepaliClock(at);
  return `${VARA[weekday].en.slice(0, 3)} ${day} ${GREGORIAN_MONTHS_SHORT[month - 1]}`;
}

/**
 * "Good morning" and the rest, on Nepal's clock.
 *
 * Read in Nepal time rather than the device's, so a user in Doha opening the
 * app at their own midnight is greeted for the hour it is back home — which
 * is the hour the rest of the screen is computed for.
 */
export function greetingFor(at: Date = new Date()): string {
  const { hour } = nepaliClock(at);
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

const DEVANAGARI_DIGITS = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];

/** 2082 -> "२०८२". Used wherever a Nepali date is shown in Nepali. */
export function devanagariNumber(value: number): string {
  return `${value}`.replace(/\d/g, (digit) => DEVANAGARI_DIGITS[Number(digit)]);
}
