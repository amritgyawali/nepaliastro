/**
 * Dates, as Nepal actually writes them.
 *
 * Three calendars run at once here. Bikram Sambat is the civil one — every
 * citizenship certificate, school record and government form uses it, so it
 * is the calendar a user knows their own birthday in. Gregorian is what the
 * ephemeris and the phone run on. Nepal Sambat is the Newar calendar, the
 * only one native to the country, and its new year is Mha Puja.
 *
 * Bikram Sambat months have no formula: their lengths are fixed each year by
 * the solar longitude at the month's start and published in the patro, which
 * is why the conversion is table-driven rather than computed.
 */
import * as Astronomy from 'astronomy-engine';
import NepaliDate, { dateConfigMap } from 'nepali-date-converter';

import { siderealLongitude } from './ephemeris';
import { VARA, devanagariNumber, fromNepaliClock, nepaliClock } from './time';

/** Bikram Sambat month names, in order. */
export const BS_MONTHS = [
  'Baishakh', 'Jestha', 'Ashar', 'Shrawan', 'Bhadra', 'Ashwin',
  'Kartik', 'Mangsir', 'Poush', 'Magh', 'Falgun', 'Chaitra',
] as const;

export const BS_MONTHS_NP = [
  'बैशाख', 'जेठ', 'असार', 'साउन', 'भदौ', 'असोज',
  'कार्तिक', 'मंसिर', 'पुष', 'माघ', 'फागुन', 'चैत',
] as const;

/** Nepal Sambat month names — the Newar year, beginning at Kachhalā. */
export const NS_MONTHS = [
  'Kachhalā', 'Thinlā', 'Pohelā', 'Sillā', 'Chillā', 'Chaulā',
  'Bachhalā', 'Tachhalā', 'Dillā', 'Gunlā', 'Yanlā', 'Kaulā',
] as const;

/** The span the Bikram Sambat tables cover. Outside it, nothing is guessed. */
const years = Object.keys(dateConfigMap).map(Number);
export const BS_MIN_YEAR = Math.min(...years);
export const BS_MAX_YEAR = Math.max(...years);

export type BsDate = {
  year: number;
  /** 1–12, Baishakh first. */
  month: number;
  day: number;
  monthName: string;
  monthNameNp: string;
  /** 0 = Sunday. */
  weekday: number;
  weekdayName: string;
  weekdayNameNp: string;
};

/** True when a BS year is inside the published tables. */
export function isBsYearSupported(year: number): boolean {
  return year >= BS_MIN_YEAR && year <= BS_MAX_YEAR;
}

/** Days in a Bikram Sambat month — 29 to 32, and never the same twice. */
export function bsMonthLength(year: number, month: number): number {
  const config = dateConfigMap[`${year}`];
  if (!config) return 30;
  return Object.values(config)[month - 1] ?? 30;
}

/** Gregorian instant -> Bikram Sambat date. */
export function toBs(at: Date): BsDate | null {
  const clock = nepaliClock(at);
  try {
    const nepali = new NepaliDate(new Date(clock.year, clock.month - 1, clock.day));
    const month = nepali.getMonth() + 1;
    const weekday = nepali.getDay();
    return {
      year: nepali.getYear(),
      month,
      day: nepali.getDate(),
      monthName: BS_MONTHS[month - 1],
      monthNameNp: BS_MONTHS_NP[month - 1],
      weekday,
      weekdayName: VARA[weekday].en,
      weekdayNameNp: VARA[weekday].np,
    };
  } catch {
    // Outside the tables the honest answer is "I don't know", not a guess.
    return null;
  }
}

/**
 * Bikram Sambat date -> the instant that day begins in Nepal.
 *
 * Nepal midnight rather than the device's own midnight. A phone in London
 * building a date from its local midnight produces an instant that is still
 * the previous day in Kathmandu, and every comparison downstream — is this
 * the day of the festival, is this today — then lands a day out for every
 * user outside Nepal. Anchoring here means it cannot.
 */
export function fromBs(year: number, month: number, day: number): Date | null {
  if (!isBsYearSupported(year)) return null;
  if (month < 1 || month > 12) return null;
  if (day < 1 || day > bsMonthLength(year, month)) return null;

  try {
    const ad = new NepaliDate(year, month - 1, day).getAD();
    return fromNepaliClock(ad.year, ad.month + 1, ad.date);
  } catch {
    return null;
  }
}

/** "५ असोज २०८३, सोमबार" — the date as a patro prints it. */
export function formatBsNepali(date: BsDate): string {
  return `${devanagariNumber(date.day)} ${date.monthNameNp} ${devanagariNumber(date.year)}, ${date.weekdayNameNp}`;
}

/** "5 Ashwin 2083, Monday". */
export function formatBs(date: BsDate): string {
  return `${date.day} ${date.monthName} ${date.year}, ${date.weekdayName}`;
}

/* ------------------------------------------------------------------ *
 * Nepal Sambat
 * ------------------------------------------------------------------ */

/**
 * Kartik Amavasya — the new moon that Laxmi Puja falls on.
 *
 * It is the dark moon that occurs while the sun stands in Tula, and the
 * Newar year turns on the day after it. Searching the real lunation rather
 * than assuming a fixed date is what keeps Mha Puja correct every year.
 */
function kartikAmavasya(gregorianYear: number): Date {
  // The sun is in sidereal Tula from about 17 October to 16 November, so a
  // search begun at the start of October is certain to find the right moon.
  let search = new Date(Date.UTC(gregorianYear, 9, 1));

  for (let i = 0; i < 3; i += 1) {
    const newMoon = Astronomy.SearchMoonPhase(0, search, 40);
    if (!newMoon) break;
    const sunSign = Math.floor(siderealLongitude('sun', newMoon.date) / 30) % 12;
    if (sunSign === 6) return newMoon.date; // Tula
    search = new Date(newMoon.date.getTime() + 86400_000);
  }

  // Fall back on the long-term average date if the search somehow misses.
  return new Date(Date.UTC(gregorianYear, 10, 1));
}

export type NepalSambat = {
  year: number;
  /** The Gregorian day this Nepal Sambat year began (Mha Puja). */
  newYear: Date;
  /** Days elapsed since that new year. */
  dayOfYear: number;
};

/**
 * The Nepal Sambat year running on a given day.
 *
 * Nepal Sambat begins in 879 CE, so the year is the Gregorian one less 879
 * once Mha Puja has passed, and one less again before it.
 */
export function toNepalSambat(at: Date): NepalSambat {
  const clock = nepaliClock(at);
  const thisYearsTurn = new Date(kartikAmavasya(clock.year).getTime() + 86400_000);

  if (at.getTime() >= thisYearsTurn.getTime()) {
    return {
      year: clock.year - 879,
      newYear: thisYearsTurn,
      dayOfYear: Math.floor((at.getTime() - thisYearsTurn.getTime()) / 86400_000) + 1,
    };
  }

  const lastYearsTurn = new Date(kartikAmavasya(clock.year - 1).getTime() + 86400_000);
  return {
    year: clock.year - 880,
    newYear: lastYearsTurn,
    dayOfYear: Math.floor((at.getTime() - lastYearsTurn.getTime()) / 86400_000) + 1,
  };
}

/* ------------------------------------------------------------------ *
 * A month, laid out for a calendar grid
 * ------------------------------------------------------------------ */

export type PatroDay = {
  bsDay: number;
  /** The instant this day begins in Nepal. */
  gregorian: Date;
  /** Day of the Gregorian month, read in Nepal time. */
  gregorianDay: number;
  /** 0 = Sunday, for placing the cell in its column. */
  weekday: number;
  isToday: boolean;
  isSaturday: boolean;
};

/**
 * One Bikram Sambat month as a grid of days.
 *
 * Saturday is flagged rather than Sunday: Nepal's weekend is Saturday, and a
 * patro prints it in red for that reason.
 */
export function bsMonthGrid(year: number, month: number, today = new Date()): PatroDay[] {
  const length = bsMonthLength(year, month);
  const todayBs = toBs(today);
  const days: PatroDay[] = [];

  for (let day = 1; day <= length; day += 1) {
    const gregorian = fromBs(year, month, day);
    if (!gregorian) continue;
    // Read in Nepal time: the weekday and the day number a patro prints are
    // Kathmandu's, whatever zone the phone is in.
    const clock = nepaliClock(gregorian);
    days.push({
      bsDay: day,
      gregorian,
      gregorianDay: clock.day,
      weekday: clock.weekday,
      isToday:
        !!todayBs && todayBs.year === year && todayBs.month === month && todayBs.day === day,
      isSaturday: clock.weekday === 6,
    });
  }

  return days;
}

/** The BS month before or after a given one, wrapping the year. */
export function shiftBsMonth(year: number, month: number, by: number): { year: number; month: number } {
  const zeroBased = month - 1 + by;
  return {
    year: year + Math.floor(zeroBased / 12),
    month: ((zeroBased % 12) + 12) % 12 + 1,
  };
}
