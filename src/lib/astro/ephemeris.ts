/**
 * The ephemeris: where the nine grahas actually are.
 *
 * Everything else in this app is a rule applied to the numbers this file
 * produces, so it is the one place that has to be right. Positions come from
 * `astronomy-engine` — VSOP87 for the planets, a Brown/Montenbruck lunar
 * theory for the moon — which is pure TypeScript and therefore runs
 * unchanged on iOS, Android and the web build. No native module, no server
 * call, no API key: a chart can be drawn on a phone in a village with no
 * signal, which is the point.
 *
 * The library works in the tropical zodiac. Vedic astrology works in the
 * sidereal one, so every longitude here has the Lahiri ayanamsa subtracted
 * before it leaves the module, and nothing downstream needs to think about
 * the difference again.
 */
import * as Astronomy from 'astronomy-engine';

import type { Place } from './places';

/* ------------------------------------------------------------------ *
 * Angles
 * ------------------------------------------------------------------ */

const DEG = Math.PI / 180;

/** Fold a longitude into [0, 360). */
export function norm360(degrees: number): number {
  const wrapped = degrees % 360;
  return wrapped < 0 ? wrapped + 360 : wrapped;
}

/** Shortest signed separation from `a` to `b`, in (-180, 180]. */
export function angleDelta(a: number, b: number): number {
  const diff = norm360(b - a);
  return diff > 180 ? diff - 360 : diff;
}

/** Absolute angular separation between two longitudes, in [0, 180]. */
export function angleBetween(a: number, b: number): number {
  return Math.abs(angleDelta(a, b));
}

/** 127.4567 -> "7°27'" within its sign — how a chart prints a position. */
export function formatDegreesInSign(longitude: number): string {
  const within = norm360(longitude) % 30;
  const degrees = Math.floor(within);
  const minutes = Math.floor((within - degrees) * 60);
  return `${degrees}°${`${minutes}`.padStart(2, '0')}'`;
}

/* ------------------------------------------------------------------ *
 * Ayanamsa
 * ------------------------------------------------------------------ */

const J2000 = 2451545.0;

/** Julian day number of an instant. */
export function julianDay(at: Date): number {
  return at.getTime() / 86400000 + 2440587.5;
}

/** Julian centuries from J2000. */
function centuriesFromJ2000(at: Date): number {
  return (julianDay(at) - J2000) / 36525;
}

/**
 * Lahiri (Chitrapaksha) ayanamsa in degrees.
 *
 * The gap between the tropical and sidereal zodiacs: accumulated general
 * precession, anchored to the Lahiri value of 23°51'11" at J2000, which is
 * the ayanamsa every Nepali and Indian panchang is computed on. The
 * polynomial is the IAU general-precession-in-longitude series, and over
 * 1900–2100 it tracks the published Lahiri tables to within about ten
 * arcseconds — far finer than any boundary the chart actually reads, the
 * half-degree shashtiamsa included.
 */
export function ayanamsa(at: Date): number {
  const t = centuriesFromJ2000(at);
  const precessionArcsec = 5029.0966 * t + 1.11113 * t * t - 0.000006 * t * t * t;
  return 23.85306 + precessionArcsec / 3600;
}

/* ------------------------------------------------------------------ *
 * The nine grahas
 * ------------------------------------------------------------------ */

export type GrahaId =
  | 'sun' | 'moon' | 'mars' | 'mercury' | 'jupiter'
  | 'venus' | 'saturn' | 'rahu' | 'ketu';

export type GrahaMeta = {
  id: GrahaId;
  /** Sanskrit name, which is what a Nepali chart is labelled with. */
  vedic: string;
  np: string;
  en: string;
  /** Two-letter tag for the tight boxes of a chart diagram. */
  short: string;
  /** Natural benefic or malefic, before any chart-specific judgement. */
  nature: 'benefic' | 'malefic' | 'neutral';
  /** Rahu and Ketu are shadows: no body, no light, never combust. */
  shadow: boolean;
};

export const GRAHAS: Record<GrahaId, GrahaMeta> = {
  sun: { id: 'sun', vedic: 'Surya', np: 'सूर्य', en: 'Sun', short: 'Su', nature: 'malefic', shadow: false },
  moon: { id: 'moon', vedic: 'Chandra', np: 'चन्द्र', en: 'Moon', short: 'Mo', nature: 'benefic', shadow: false },
  mars: { id: 'mars', vedic: 'Mangal', np: 'मङ्गल', en: 'Mars', short: 'Ma', nature: 'malefic', shadow: false },
  mercury: { id: 'mercury', vedic: 'Budha', np: 'बुध', en: 'Mercury', short: 'Me', nature: 'neutral', shadow: false },
  jupiter: { id: 'jupiter', vedic: 'Guru', np: 'बृहस्पति', en: 'Jupiter', short: 'Ju', nature: 'benefic', shadow: false },
  venus: { id: 'venus', vedic: 'Shukra', np: 'शुक्र', en: 'Venus', short: 'Ve', nature: 'benefic', shadow: false },
  saturn: { id: 'saturn', vedic: 'Shani', np: 'शनि', en: 'Saturn', short: 'Sa', nature: 'malefic', shadow: false },
  rahu: { id: 'rahu', vedic: 'Rahu', np: 'राहु', en: 'North Node', short: 'Ra', nature: 'malefic', shadow: true },
  ketu: { id: 'ketu', vedic: 'Ketu', np: 'केतु', en: 'South Node', short: 'Ke', nature: 'malefic', shadow: true },
};

/** The nine, in the order every chart and dasha table lists them. */
export const GRAHA_ORDER: GrahaId[] = [
  'sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn', 'rahu', 'ketu',
];

const BODY_OF: Partial<Record<GrahaId, Astronomy.Body>> = {
  sun: Astronomy.Body.Sun,
  moon: Astronomy.Body.Moon,
  mars: Astronomy.Body.Mars,
  mercury: Astronomy.Body.Mercury,
  jupiter: Astronomy.Body.Jupiter,
  venus: Astronomy.Body.Venus,
  saturn: Astronomy.Body.Saturn,
};

/**
 * Rahu — the moon's mean ascending node, tropical.
 *
 * Nepali and Indian panchangs are computed on the *mean* node rather than the
 * osculating true one; the two differ by up to about 1°40', enough to move a
 * nakshatra, so following the almanac is the right call for an app whose
 * answers people will check against their own patro.
 */
function meanNodeTropical(at: Date): number {
  const t = centuriesFromJ2000(at);
  return norm360(
    125.0445479 -
      1934.1362891 * t +
      0.0020754 * t * t +
      (t * t * t) / 467441 -
      (t * t * t * t) / 60616000,
  );
}

/** Tropical geocentric ecliptic longitude of a graha, in degrees. */
function tropicalLongitude(graha: GrahaId, at: Date): number {
  if (graha === 'rahu') return meanNodeTropical(at);
  if (graha === 'ketu') return norm360(meanNodeTropical(at) + 180);
  if (graha === 'moon') return norm360(Astronomy.EclipticGeoMoon(at).lon);

  const body = BODY_OF[graha];
  if (!body) return 0;
  // `true` applies aberration and light-travel time: the position the sky
  // actually shows, which is what an observed almanac tabulates.
  return norm360(Astronomy.Ecliptic(Astronomy.GeoVector(body, at, true)).elon);
}

/** Geocentric ecliptic *latitude*, needed for the war-of-planets check. */
function tropicalLatitude(graha: GrahaId, at: Date): number {
  if (graha === 'rahu' || graha === 'ketu') return 0;
  if (graha === 'moon') return Astronomy.EclipticGeoMoon(at).lat;
  const body = BODY_OF[graha];
  if (!body) return 0;
  return Astronomy.Ecliptic(Astronomy.GeoVector(body, at, true)).elat;
}

/** Sidereal (Lahiri) longitude of a graha — the number the chart is built on. */
export function siderealLongitude(graha: GrahaId, at: Date): number {
  return norm360(tropicalLongitude(graha, at) - ayanamsa(at));
}

/**
 * Daily motion in degrees, signed.
 *
 * A central difference over six hours either side. Negative means retrograde,
 * which every chart marks, because a retrograde graha is read differently.
 */
function dailyMotion(graha: GrahaId, at: Date): number {
  const sixHours = 6 * 3600 * 1000;
  const before = tropicalLongitude(graha, new Date(at.getTime() - sixHours));
  const after = tropicalLongitude(graha, new Date(at.getTime() + sixHours));
  return angleDelta(before, after) * 2;
}

/**
 * How close to the sun a graha stops being visible, in degrees.
 *
 * A combust graha is held to lose its power to act, so the thresholds are
 * part of the reading, not a footnote. These are the classical values.
 */
const COMBUSTION_ORB: Partial<Record<GrahaId, number>> = {
  moon: 12,
  mars: 17,
  mercury: 14,
  jupiter: 11,
  venus: 10,
  saturn: 15,
};

export type GrahaPosition = {
  graha: GrahaMeta;
  /** Sidereal longitude, 0–360. */
  longitude: number;
  /** Ecliptic latitude, for planetary war. */
  latitude: number;
  /** Degrees per day, signed. */
  speed: number;
  retrograde: boolean;
  /** Too close to the sun to be seen, and so held to be weakened. */
  combust: boolean;
  /** Sign index 0–11 from Mesha. */
  rashi: number;
  /** Position within the sign, 0–30. */
  degreeInRashi: number;
  /** Nakshatra index 0–26 from Ashwini. */
  nakshatra: number;
  /** Quarter of the nakshatra, 1–4. */
  pada: number;
};

/** Where all nine grahas are at an instant. */
export function grahaPositions(at: Date): Record<GrahaId, GrahaPosition> {
  const sunLongitude = siderealLongitude('sun', at);
  const out = {} as Record<GrahaId, GrahaPosition>;

  for (const id of GRAHA_ORDER) {
    const longitude = siderealLongitude(id, at);
    const speed = dailyMotion(id, at);
    const orb = COMBUSTION_ORB[id];

    out[id] = {
      graha: GRAHAS[id],
      longitude,
      latitude: tropicalLatitude(id, at),
      speed,
      // The nodes always move backwards; that is their nature, not a station,
      // so a chart marks them retrograde but never reads it as a reversal.
      retrograde: speed < 0,
      combust: orb !== undefined && angleBetween(longitude, sunLongitude) <= orb,
      rashi: Math.floor(longitude / 30) % 12,
      degreeInRashi: longitude % 30,
      nakshatra: Math.floor(longitude / (360 / 27)) % 27,
      pada: Math.floor((longitude % (360 / 27)) / (360 / 108)) + 1,
    };
  }

  return out;
}

/* ------------------------------------------------------------------ *
 * Risings and settings
 * ------------------------------------------------------------------ */

function observerFor(place: Place): Astronomy.Observer {
  return new Astronomy.Observer(place.latitude, place.longitude, place.elevation);
}

/**
 * Sunrise, sunset, moonrise and moonset for the day `at` falls on.
 *
 * The search runs from local midnight forward, so "today's sunrise" is the
 * one that belongs to today. Moonrise can genuinely be absent on a given
 * date — the moon rises about fifty minutes later each day, so roughly once
 * a month a calendar day has none — and the caller gets `null` rather than a
 * fabricated time.
 */
export function riseSet(
  body: 'sun' | 'moon',
  dayStart: Date,
  place: Place,
): { rise: Date | null; set: Date | null } {
  const observer = observerFor(place);
  const astroBody = body === 'sun' ? Astronomy.Body.Sun : Astronomy.Body.Moon;

  try {
    const rise = Astronomy.SearchRiseSet(astroBody, observer, +1, dayStart, 1);
    const set = Astronomy.SearchRiseSet(astroBody, observer, -1, dayStart, 1);
    return { rise: rise ? rise.date : null, set: set ? set.date : null };
  } catch {
    // Above the polar circles the sun may not cross the horizon at all.
    return { rise: null, set: null };
  }
}

/**
 * Local apparent sidereal time in degrees.
 *
 * This is what turns a clock time into an ascendant: the degree of the
 * ecliptic on the eastern horizon depends on how far the earth has turned,
 * and this is that angle.
 */
export function localSiderealDegrees(at: Date, place: Place): number {
  const greenwichHours = Astronomy.SiderealTime(at);
  return norm360(greenwichHours * 15 + place.longitude);
}

/** True obliquity of the ecliptic in degrees — the tilt the ascendant needs. */
export function obliquity(at: Date): number {
  const t = centuriesFromJ2000(at);
  // IAU 1980 mean obliquity; nutation in obliquity is under 10", which moves
  // the ascendant by well under an arcminute.
  return (
    23.439291111 -
    0.0130041667 * t -
    1.638889e-7 * t * t +
    5.036111e-7 * t * t * t
  );
}

export { DEG };
