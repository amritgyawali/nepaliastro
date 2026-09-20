/**
 * Panchang figures for the home screen.
 *
 * These are standard low-precision astronomical approximations, not an
 * ephemeris: sunrise and sunset come from the usual sunrise equation, and
 * the tithi and nakshatra from mean lunar elements. That is accurate to
 * roughly a minute for the sun and a fraction of a tithi for the moon, which
 * is the right order of precision for a dashboard row. A production build
 * that needs ritual-grade timings should take them from a panchang service
 * instead — only this file would change.
 */

/** Kathmandu, and the +05:45 offset Nepal keeps all year. */
export const KATHMANDU = {
  label: 'Kathmandu',
  latitude: 27.7172,
  longitude: 85.324,
  utcOffsetMinutes: 345,
} as const;

const RAD = Math.PI / 180;
const J2000 = 2451545.0;

function toJulian(date: Date): number {
  return date.getTime() / 86400000 + 2440587.5;
}

/** Julian day -> "HH:MM" on the given fixed UTC offset. */
function formatJulianLocal(julian: number, utcOffsetMinutes: number): string {
  const ms = (julian - 2440587.5) * 86400000 + utcOffsetMinutes * 60000;
  const local = new Date(ms);
  const hours = `${local.getUTCHours()}`.padStart(2, '0');
  const minutes = `${local.getUTCMinutes()}`.padStart(2, '0');
  return `${hours}:${minutes}`;
}

export type SunTimes = { sunrise: string; sunset: string };

/**
 * Sunrise and sunset for the calendar day `date` falls on.
 *
 * Returns `--:--` above the polar circles, where the sun may not cross the
 * horizon at all and the equation has no solution.
 */
export function sunTimesFor(
  date = new Date(),
  place: { latitude: number; longitude: number; utcOffsetMinutes: number } = KATHMANDU,
): SunTimes {
  // The equation is written for longitude measured west-positive.
  const west = -place.longitude;
  const cycle = Math.round(toJulian(date) - J2000 - 0.0009 - west / 360);
  const solarNoonApprox = J2000 + 0.0009 + west / 360 + cycle;

  const meanAnomaly = (357.5291 + 0.98560028 * (solarNoonApprox - J2000)) % 360;
  const centre =
    1.9148 * Math.sin(meanAnomaly * RAD) +
    0.02 * Math.sin(2 * meanAnomaly * RAD) +
    0.0003 * Math.sin(3 * meanAnomaly * RAD);
  const eclipticLongitude = (meanAnomaly + centre + 180 + 102.9372) % 360;

  const transit =
    solarNoonApprox +
    0.0053 * Math.sin(meanAnomaly * RAD) -
    0.0069 * Math.sin(2 * eclipticLongitude * RAD);

  const declination = Math.asin(
    Math.sin(eclipticLongitude * RAD) * Math.sin(23.4397 * RAD),
  );
  // -0.833° puts the sun's upper limb on the horizon, refraction included.
  const cosHourAngle =
    (Math.sin(-0.833 * RAD) -
      Math.sin(place.latitude * RAD) * Math.sin(declination)) /
    (Math.cos(place.latitude * RAD) * Math.cos(declination));

  if (cosHourAngle > 1 || cosHourAngle < -1) {
    return { sunrise: '--:--', sunset: '--:--' };
  }

  const hourAngle = Math.acos(cosHourAngle) / RAD;
  return {
    sunrise: formatJulianLocal(transit - hourAngle / 360, place.utcOffsetMinutes),
    sunset: formatJulianLocal(transit + hourAngle / 360, place.utcOffsetMinutes),
  };
}

/* ------------------------------------------------------------------ *
 * Moon
 * ------------------------------------------------------------------ */

const SYNODIC_MONTH = 29.530588853;
/** New moon of 6 January 2000, the usual epoch for phase arithmetic. */
const KNOWN_NEW_MOON = 2451550.1;

const TITHI_NAMES = [
  'Pratipada', 'Dwitiya', 'Tritiya', 'Chaturthi', 'Panchami',
  'Shashthi', 'Saptami', 'Ashtami', 'Navami', 'Dashami',
  'Ekadashi', 'Dwadashi', 'Trayodashi', 'Chaturdashi',
] as const;

const NAKSHATRA_NAMES = [
  'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra',
  'Punarvasu', 'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni',
  'Uttara Phalguni', 'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha',
  'Jyeshtha', 'Mula', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana',
  'Dhanishta', 'Shatabhisha', 'Purva Bhadrapada', 'Uttara Bhadrapada',
  'Revati',
] as const;

export type Tithi = {
  /** 1-30 across both fortnights. */
  index: number;
  name: string;
  paksha: 'Shukla' | 'Krishna';
  /** 0-1 through the synodic month, for the moon glyph. */
  phase: number;
};

/** The tithi running at `date`, from the moon's mean phase. */
export function tithiFor(date = new Date()): Tithi {
  const elapsed = (toJulian(date) - KNOWN_NEW_MOON) / SYNODIC_MONTH;
  const phase = elapsed - Math.floor(elapsed);
  const index = Math.floor(phase * 30) + 1;
  const waxing = index <= 15;
  const within = waxing ? index : index - 15;

  let name: string;
  if (within === 15) {
    name = waxing ? 'Purnima' : 'Amavasya';
  } else {
    name = TITHI_NAMES[within - 1];
  }

  return { index, name, paksha: waxing ? 'Shukla' : 'Krishna', phase };
}

/** Lahiri ayanamsa, linear around its 2000 value — good to a few arcminutes. */
function ayanamsaFor(julian: number): number {
  return 23.85 + ((julian - J2000) / 365.25) * 0.013969;
}

/** The moon's mean tropical longitude, to about a degree. */
function moonTropicalLongitude(julian: number): number {
  const days = julian - J2000;
  const meanLongitude = 218.316 + 13.176396 * days;
  const meanAnomaly = 134.963 + 13.064993 * days;
  // The leading term of the evection-free series; ~1° of the true position.
  return meanLongitude + 6.289 * Math.sin(meanAnomaly * RAD);
}

/** The sun's tropical longitude, from its mean anomaly and equation of centre. */
function sunTropicalLongitude(julian: number): number {
  const days = julian - J2000;
  const meanAnomaly = (357.5291 + 0.98560028 * days) % 360;
  const centre =
    1.9148 * Math.sin(meanAnomaly * RAD) +
    0.02 * Math.sin(2 * meanAnomaly * RAD) +
    0.0003 * Math.sin(3 * meanAnomaly * RAD);
  return meanAnomaly + centre + 180 + 102.9372;
}

function normalise(degrees: number): number {
  return ((degrees % 360) + 360) % 360;
}

/**
 * Sidereal (Lahiri) longitudes of the sun and moon, in degrees.
 *
 * These are the two bodies this app computes for real; everything a chart
 * shows is derived from them, and nothing is invented to fill the gaps.
 */
export function siderealLongitudes(date = new Date()): { sun: number; moon: number } {
  const julian = toJulian(date);
  const ayanamsa = ayanamsaFor(julian);
  return {
    sun: normalise(sunTropicalLongitude(julian) - ayanamsa),
    moon: normalise(moonTropicalLongitude(julian) - ayanamsa),
  };
}

export type Nakshatra = { index: number; name: string; pada: number };

/** The nakshatra the moon sits in, from its mean longitude. */
export function nakshatraFor(date = new Date()): Nakshatra {
  return nakshatraAt(siderealLongitudes(date).moon);
}

/** The nakshatra a sidereal longitude falls in. */
export function nakshatraAt(siderealLongitude: number): Nakshatra {
  const span = 360 / 27;
  const index = Math.floor(normalise(siderealLongitude) / span);
  const pada = Math.floor((normalise(siderealLongitude) % span) / (span / 4)) + 1;
  return { index, name: NAKSHATRA_NAMES[index], pada };
}

export { NAKSHATRA_NAMES };

export type Panchang = {
  place: string;
  sun: SunTimes;
  tithi: Tithi;
  nakshatra: Nakshatra;
};

export function panchangFor(date = new Date()): Panchang {
  return {
    place: KATHMANDU.label,
    sun: sunTimesFor(date),
    tithi: tithiFor(date),
    nakshatra: nakshatraFor(date),
  };
}
