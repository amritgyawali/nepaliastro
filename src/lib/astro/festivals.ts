/**
 * The Nepali festival year, computed rather than listed.
 *
 * Almost every festival in Nepal is fixed to a tithi, not to a date, which is
 * why they move by up to three weeks between years and why a hardcoded list
 * goes stale the moment it ships. Each festival here is defined the way the
 * panchang defines it — a tithi occurring while the sun stands in a
 * particular sign — and the date is found by searching the real ephemeris.
 *
 * Dashain and Tihar get their tika windows too, because "tika ko sait kahile
 * ho" is the single most asked astrology question in the country.
 */
import * as Astronomy from 'astronomy-engine';

import { siderealLongitude } from './ephemeris';
import { KATHMANDU, type Place } from './places';
import { panchangFor, tithiAt, type Window } from './panchang';
import { fromBs, toBs } from './bikram';
import { addDays, startOfNepaliDay } from './time';

export type FestivalDefinition = {
  id: string;
  name: string;
  np: string;
  about: string;
  /** 1–15 is Shukla, 16–30 is Krishna, counted from the new moon. */
  tithi: number;
  /**
   * Amanta lunar month, 0 = Baishakh.
   *
   * Amanta — the month running new moon to new moon — rather than the
   * purnimanta naming used in the hills, because amanta pins a tithi to
   * exactly one month. In purnimanta the Krishna paksha carries the *next*
   * month's name, which is why Gai Jatra is called a Bhadra festival but
   * falls in amanta Shrawan.
   */
  month: number;
  /** A national holiday, for the patro to mark in red. */
  holiday: boolean;
  /**
   * Which moment of the day the tithi is read at.
   *
   * Almost every festival is kept on the day its tithi runs at sunrise.
   * Shivaratri is the exception: it is kept through nishita kaal, the middle
   * of the night, so it is read at midnight instead and lands a day earlier
   * than a sunrise reading would put it.
   */
  reference?: 'sunrise' | 'midnight';
};

/**
 * The festivals, in the order of the Nepali year from Baishakh.
 *
 * A festival is identified by its tithi plus the solar month it falls in —
 * together those are unique within a year, which is exactly how a lunar
 * calendar pins a date to the seasons.
 */
export const FESTIVALS: FestivalDefinition[] = [
  { id: 'buddhajayanti', name: 'Buddha Jayanti', np: 'बुद्ध जयन्ती', about: 'The Buddha’s birth, enlightenment and passing, all on one full moon', tithi: 15, month: 0, holiday: true },
  { id: 'janaipurnima', name: 'Janai Purnima', np: 'जनै पूर्णिमा', about: 'The sacred thread is changed; rakhi is tied on the wrist', tithi: 15, month: 3, holiday: true },
  { id: 'gaijatra', name: 'Gai Jatra', np: 'गाईजात्रा', about: 'The cow procession for those who died in the year', tithi: 16, month: 3, holiday: true },
  { id: 'janmashtami', name: 'Krishna Janmashtami', np: 'कृष्ण जन्माष्टमी', about: 'Krishna’s birth, at midnight', tithi: 23, month: 3, holiday: true },
  { id: 'teej', name: 'Haritalika Teej', np: 'हरितालिका तीज', about: 'Women fast for their husbands, and dance in red', tithi: 3, month: 4, holiday: true },
  { id: 'rishipanchami', name: 'Rishi Panchami', np: 'ऋषि पञ्चमी', about: 'The day after Teej — bathing and the seven sages', tithi: 5, month: 4, holiday: false },
  { id: 'indrajatra', name: 'Indra Jatra', np: 'इन्द्रजात्रा', about: 'Kathmandu’s own festival — the Kumari rides', tithi: 14, month: 4, holiday: true },
  { id: 'ghatasthapana', name: 'Ghatasthapana', np: 'घटस्थापना', about: 'Dashain begins — the jamara is sown', tithi: 1, month: 5, holiday: true },
  { id: 'phulpati', name: 'Phulpati', np: 'फूलपाती', about: 'The flowers and leaves are brought in from Gorkha', tithi: 7, month: 5, holiday: true },
  { id: 'mahaashtami', name: 'Maha Ashtami', np: 'महाअष्टमी', about: 'Kalratri — the night of sacrifice', tithi: 8, month: 5, holiday: true },
  { id: 'mahanavami', name: 'Maha Navami', np: 'महानवमी', about: 'Taleju opens; tools and vehicles are worshipped', tithi: 9, month: 5, holiday: true },
  { id: 'dashain', name: 'Vijaya Dashami', np: 'विजया दशमी', about: 'Dashain tika — elders give tika and jamara to the young', tithi: 10, month: 5, holiday: true },
  { id: 'kojagrat', name: 'Kojagrat Purnima', np: 'कोजाग्रत पूर्णिमा', about: 'Dashain closes; Laxmi walks at night asking who is awake', tithi: 15, month: 5, holiday: true },
  { id: 'kagtihar', name: 'Kag Tihar', np: 'काग तिहार', about: 'Tihar begins — the crow, Yama’s messenger, is fed', tithi: 28, month: 5, holiday: false },
  { id: 'kukurtihar', name: 'Kukur Tihar', np: 'कुकुर तिहार', about: 'The dog is garlanded and given tika', tithi: 29, month: 5, holiday: true },
  { id: 'laxmipuja', name: 'Laxmi Puja', np: 'लक्ष्मी पूजा', about: 'The cow in the morning, Laxmi at dusk, lamps all night', tithi: 30, month: 5, holiday: true },
  { id: 'mhapuja', name: 'Govardhan and Mha Puja', np: 'म्ह: पूजा', about: 'The Newar new year — the self is worshipped', tithi: 1, month: 6, holiday: true },
  { id: 'bhaitika', name: 'Bhai Tika', np: 'भाइटीका', about: 'Sisters give seven-coloured tika and a wall of oil', tithi: 2, month: 6, holiday: true },
  { id: 'chhath', name: 'Chhath', np: 'छठ', about: 'The Madhesh offers to the setting and rising sun', tithi: 6, month: 6, holiday: true },
  { id: 'yomari', name: 'Yomari Punhi', np: 'योमरी पुन्ही', about: 'The harvest full moon, and the yomari steamed for it', tithi: 15, month: 7, holiday: false },
  { id: 'basantapanchami', name: 'Basanta Panchami', np: 'बसन्त पञ्चमी', about: 'Saraswati’s day — children are first given a pen', tithi: 5, month: 9, holiday: true },
  { id: 'shivaratri', name: 'Maha Shivaratri', np: 'महाशिवरात्री', about: 'Pashupatinath through the night', tithi: 29, month: 9, holiday: true, reference: 'midnight' },
  { id: 'holi', name: 'Fagu Purnima (Holi)', np: 'फागु पूर्णिमा', about: 'Colour — the hills a day after the tarai', tithi: 15, month: 10, holiday: true },
  { id: 'ramnavami', name: 'Ram Navami', np: 'राम नवमी', about: 'Ram’s birth, kept largest at Janakpur', tithi: 9, month: 11, holiday: true },
];

export type Festival = {
  id: string;
  name: string;
  np: string;
  about: string;
  date: Date;
  holiday: boolean;
  /** Bikram Sambat date, for showing it the way a patro does. */
  bs: ReturnType<typeof toBs>;
  /** The tika window, on the two days that have one. */
  sait: Window | null;
  saitNote: string | null;
};

/**
 * The amanta lunar month a day belongs to, 0 = Baishakh.
 *
 * The month is named for the sidereal sign the sun stands in at the new moon
 * that opens it, so this finds the last new moon on or before the day and
 * reads the sun there.
 */
function amantaMonth(day: Date): number {
  let newMoon = Astronomy.SearchMoonPhase(0, new Date(day.getTime() - 31 * 86400_000), 33);
  if (!newMoon) return 0;

  // A 31-day window can hold two new moons; the later one wins if it has
  // already passed.
  const next = Astronomy.SearchMoonPhase(0, new Date(newMoon.date.getTime() + 86400_000), 33);
  if (next && next.date <= day) newMoon = next;

  return Math.floor(siderealLongitude('sun', newMoon.date) / 30) % 12;
}

/**
 * How far forward a festival is searched for.
 *
 * Long enough to cover a lunation that opens late in its window, which is
 * what a tithi at the end of the month needs.
 *
 * Known limit: in a year with an adhik masa the same lunar month occurs
 * twice, and this takes the first. Festivals are traditionally kept in the
 * second — worth an astrologer's check in those years.
 */
const SEARCH_DAYS = 100;

/** Does the festival's tithi run at sunrise on this day, in the right month? */
function matches(day: Date, definition: FestivalDefinition, place: Place): boolean {
  const panchang = panchangFor(day, place);
  const reference =
    definition.reference === 'midnight'
      ? new Date(startOfNepaliDay(day).getTime() + 86400_000)
      : panchang.sunrise ?? day;

  return (
    tithiAt(reference).index === definition.tithi &&
    amantaMonth(reference) === definition.month
  );
}

/**
 * The day a festival falls on in a given Gregorian year.
 *
 * A tithi can begin and end without ever being current at a sunrise, in which
 * case the festival is kept on the day it is current for the longest — so the
 * search falls back to whichever day holds the most of it.
 */
function findFestival(
  definition: FestivalDefinition,
  year: number,
  place: Place,
): Date | null {
  // Amanta month n opens with the new moon while the sun is in sign n, which
  // falls between the 15th of Gregorian month n+3 and the 15th of n+4. Start
  // a fortnight early and run ten weeks to cover the whole lunation.
  const approximateMonth = (definition.month + 2) % 12;
  // Magh's lunation opens in December, so a listing for Gregorian year Y has
  // to begin its search in December of the year before.
  const searchYear = approximateMonth === 11 ? year - 1 : year;
  const start = startOfNepaliDay(new Date(searchYear, approximateMonth, 1, 12));

  // A hundred days rather than a lunation: the month itself drifts by up to
  // four weeks against the Gregorian calendar, so a tithi late in the month
  // can land well over two months after the window opens. Matching on the
  // lunar month keeps the long window from catching the next lunation's tithi
  // of the same number.
  for (let i = 0; i < SEARCH_DAYS; i += 1) {
    const day = addDays(new Date(start.getTime() + 12 * 3600_000), i);
    if (matches(day, definition, place)) return startOfNepaliDay(day);
  }

  // The tithi was skipped at every sunrise in the window — a tithi shorter
  // than a day can do that. Take the day it was running at midday instead.
  for (let i = 0; i < SEARCH_DAYS; i += 1) {
    const day = addDays(new Date(start.getTime() + 12 * 3600_000), i);
    if (tithiAt(day).index === definition.tithi && amantaMonth(day) === definition.month) {
      return startOfNepaliDay(day);
    }
  }

  return null;
}

/**
 * The tika window for Dashain and Bhai Tika.
 *
 * The Nepal Panchanga Nirnayak Samiti announces an official sait each year
 * and that announcement is what families follow, so this is offered as the
 * computed auspicious window rather than as the official one, and the note
 * says so. It is the abhijit muhurta where the tithi still holds, which is
 * what the Samiti's own sait almost always falls close to.
 */
function tikaSait(day: Date, place: Place): { window: Window | null; note: string } {
  const panchang = panchangFor(day, place);
  const windows = panchang.windows;
  if (!windows) return { window: null, note: '' };

  const tithiEnds = panchang.tithi.endsAt;

  // Abhijit first where the day has one — it is the strongest muhurta and the
  // official sait usually sits near it. Otherwise the best choghadiya still
  // inside the tithi, ranked Amrit before Shubh before Labh, and never one
  // that runs into rahu kaal.
  const rank: Record<string, number> = { Amrit: 4, Shubh: 3, Labh: 2, Char: 1 };
  const choghadiya = windows.choghadiyaDay
    .filter(
      (w) =>
        w.quality === 'good' &&
        w.from < tithiEnds &&
        !(w.from < windows.rahuKaal.to && windows.rahuKaal.from < w.to),
    )
    .sort((a, b) => (rank[b.name] ?? 0) - (rank[a.name] ?? 0));

  const abhijit =
    windows.abhijit && windows.abhijit.from < tithiEnds ? windows.abhijit : null;

  return {
    window: abhijit ?? choghadiya[0] ?? windows.abhijit,
    note: 'Computed from the running tithi and the day’s abhijit muhurta. The Nepal Panchanga Nirnayak Samiti publishes the official sait each year — follow that when it is announced.',
  };
}

/** Every festival in a Gregorian year, in date order. */
export function festivalsIn(year: number, place: Place = KATHMANDU): Festival[] {
  const found: Festival[] = [];

  for (const definition of FESTIVALS) {
    const date = findFestival(definition, year, place);
    if (!date) continue;

    const hasSait = definition.id === 'dashain' || definition.id === 'bhaitika';
    const sait = hasSait ? tikaSait(date, place) : null;

    found.push({
      id: definition.id,
      name: definition.name,
      np: definition.np,
      about: definition.about,
      date,
      holiday: definition.holiday,
      bs: toBs(date),
      sait: sait?.window ?? null,
      saitNote: sait?.note ?? null,
    });
  }

  // The two festivals that are solar, not lunar, and so never move much.
  const maghe = solarIngressDay(year, 9, place);
  if (maghe) {
    found.push({
      id: 'maghesankranti', name: 'Maghe Sankranti', np: 'माघे संक्रान्ति',
      about: 'The sun turns north — tarul, chaku and ghee',
      date: maghe, holiday: true, bs: toBs(maghe), sait: null, saitNote: null,
    });
  }

  const newYear = nepaliNewYear(year);
  if (newYear) {
    found.push({
      id: 'nayabarsha', name: 'Nepali New Year', np: 'नयाँ वर्ष',
      about: 'Baishakh 1 — the Bikram Sambat year turns',
      date: newYear, holiday: true, bs: toBs(newYear), sait: null, saitNote: null,
    });
  }

  return found.sort((a, b) => a.date.getTime() - b.date.getTime());
}

/** The day the sun enters a sidereal sign — a sankranti. */
function solarIngressDay(year: number, sign: number, place: Place): Date | null {
  const approximateMonth = (sign + 3) % 12;
  const start = new Date(year, approximateMonth, 1, 12);

  for (let i = 0; i < 45; i += 1) {
    const day = addDays(start, i);
    const before = Math.floor(siderealLongitude('sun', addDays(day, -1)) / 30) % 12;
    const now = Math.floor(siderealLongitude('sun', day) / 30) % 12;
    if (before !== sign && now === sign) return startOfNepaliDay(day);
  }
  return null;
}

/** Baishakh 1 of the Bikram Sambat year that begins in this Gregorian year. */
function nepaliNewYear(year: number): Date | null {
  const bs = toBs(new Date(year, 5, 1));
  if (!bs) return null;
  return fromBs(bs.year, 1, 1);
}

/** The next festivals from today, for a home-screen strip. */
export function upcomingFestivals(
  from: Date = new Date(),
  count = 5,
  place: Place = KATHMANDU,
): Festival[] {
  const thisYear = festivalsIn(from.getFullYear(), place);
  const nextYear = festivalsIn(from.getFullYear() + 1, place);
  const start = startOfNepaliDay(from).getTime();

  return [...thisYear, ...nextYear]
    .filter((f) => f.date.getTime() >= start)
    .slice(0, count);
}
