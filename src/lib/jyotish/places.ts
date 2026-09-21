/**
 * Birth places.
 *
 * A chart is only as good as its place: the ascendant moves a whole sign in
 * roughly two hours, and two degrees of latitude between Kathmandu and
 * Biratnagar already shifts sunrise by minutes. So the app ships real
 * coordinates for the towns Nepali users are actually born in, rather than
 * quietly drawing every chart for the capital.
 *
 * The list covers all seven provinces, the district headquarters, and the
 * cities with the largest Nepali diaspora — a user born in Doha or Kuala
 * Lumpur needs their own longitude, not Kathmandu's.
 */

export type Place = {
  id: string;
  name: string;
  /** Province for Nepali towns, country for everywhere else. */
  region: string;
  latitude: number;
  /** East-positive. */
  longitude: number;
  /** Minutes east of UTC. Nepal is +05:45 and never changes. */
  utcOffsetMinutes: number;
  /** Metres above sea level; moves sunrise by seconds, not minutes. */
  elevation: number;
};

export const KATHMANDU: Place = {
  id: 'kathmandu',
  name: 'Kathmandu',
  region: 'Bagmati',
  latitude: 27.7172,
  longitude: 85.324,
  utcOffsetMinutes: 345,
  elevation: 1400,
};

const NP = (
  id: string,
  name: string,
  region: string,
  latitude: number,
  longitude: number,
  elevation: number,
): Place => ({ id, name, region, latitude, longitude, utcOffsetMinutes: 345, elevation });

export const PLACES: Place[] = [
  /* Bagmati ----------------------------------------------------------- */
  KATHMANDU,
  NP('lalitpur', 'Lalitpur', 'Bagmati', 27.6667, 85.3167, 1400),
  NP('bhaktapur', 'Bhaktapur', 'Bagmati', 27.671, 85.4298, 1401),
  NP('hetauda', 'Hetauda', 'Bagmati', 27.4287, 85.0322, 474),
  NP('bharatpur', 'Bharatpur', 'Bagmati', 27.6833, 84.4333, 208),
  NP('banepa', 'Banepa', 'Bagmati', 27.6306, 85.5217, 1465),
  NP('dhulikhel', 'Dhulikhel', 'Bagmati', 27.6222, 85.5433, 1550),
  NP('sindhuli', 'Sindhuli', 'Bagmati', 27.2569, 85.9139, 460),
  NP('charikot', 'Charikot', 'Bagmati', 27.6667, 86.05, 1550),
  NP('nuwakot', 'Nuwakot', 'Bagmati', 27.9167, 85.1667, 1000),
  NP('dhading', 'Dhading Besi', 'Bagmati', 27.8667, 84.9, 750),
  NP('rasuwa', 'Dhunche', 'Bagmati', 28.1119, 85.2969, 1960),

  /* Koshi -------------------------------------------------------------- */
  NP('biratnagar', 'Biratnagar', 'Koshi', 26.4525, 87.2718, 72),
  NP('dharan', 'Dharan', 'Koshi', 26.8065, 87.2846, 349),
  NP('itahari', 'Itahari', 'Koshi', 26.6646, 87.2718, 110),
  NP('dhankuta', 'Dhankuta', 'Koshi', 26.9833, 87.35, 1200),
  NP('ilam', 'Ilam', 'Koshi', 26.9094, 87.9286, 1206),
  NP('birtamod', 'Birtamod', 'Koshi', 26.6425, 88.0, 110),
  NP('damak', 'Damak', 'Koshi', 26.6606, 87.7006, 137),
  NP('bhadrapur', 'Bhadrapur', 'Koshi', 26.5448, 88.0895, 91),
  NP('inaruwa', 'Inaruwa', 'Koshi', 26.6, 87.15, 90),
  NP('rajbiraj', 'Rajbiraj', 'Koshi', 26.5384, 86.7419, 74),
  NP('khandbari', 'Khandbari', 'Koshi', 27.3745, 87.2077, 1040),
  NP('phidim', 'Phidim', 'Koshi', 27.15, 87.75, 1200),
  NP('taplejung', 'Taplejung', 'Koshi', 27.35, 87.6667, 1820),
  NP('solukhumbu', 'Salleri', 'Koshi', 27.5, 86.5833, 2390),
  NP('okhaldhunga', 'Okhaldhunga', 'Koshi', 27.3167, 86.5, 1700),

  /* Madhesh ------------------------------------------------------------ */
  NP('janakpur', 'Janakpur', 'Madhesh', 26.7288, 85.9266, 74),
  NP('birgunj', 'Birgunj', 'Madhesh', 27.0104, 84.8821, 93),
  NP('kalaiya', 'Kalaiya', 'Madhesh', 27.0333, 85.0, 89),
  NP('gaur', 'Gaur', 'Madhesh', 26.7667, 85.2833, 70),
  NP('malangwa', 'Malangwa', 'Madhesh', 26.8631, 85.5583, 78),
  NP('jaleshwar', 'Jaleshwar', 'Madhesh', 26.6439, 85.8, 70),
  NP('siraha', 'Siraha', 'Madhesh', 26.65, 86.2167, 82),
  NP('lahan', 'Lahan', 'Madhesh', 26.7208, 86.4833, 105),

  /* Gandaki ------------------------------------------------------------ */
  NP('pokhara', 'Pokhara', 'Gandaki', 28.2096, 83.9856, 822),
  NP('gorkha', 'Gorkha', 'Gandaki', 28.0, 84.6333, 1135),
  NP('baglung', 'Baglung', 'Gandaki', 28.2719, 83.5892, 1000),
  NP('damauli', 'Damauli', 'Gandaki', 27.9833, 84.2667, 415),
  NP('besisahar', 'Besisahar', 'Gandaki', 28.2333, 84.3833, 760),
  NP('waling', 'Waling', 'Gandaki', 27.9833, 83.7667, 750),
  NP('beni', 'Beni', 'Gandaki', 28.35, 83.5667, 899),
  NP('jomsom', 'Jomsom', 'Gandaki', 28.7806, 83.7228, 2700),
  NP('kushma', 'Kushma', 'Gandaki', 28.2333, 83.6833, 900),
  NP('manang', 'Chame', 'Gandaki', 28.55, 84.2333, 2670),

  /* Lumbini ------------------------------------------------------------ */
  NP('butwal', 'Butwal', 'Lumbini', 27.7006, 83.4484, 150),
  NP('siddharthanagar', 'Siddharthanagar (Bhairahawa)', 'Lumbini', 27.5, 83.45, 105),
  NP('nepalgunj', 'Nepalgunj', 'Lumbini', 28.05, 81.6167, 150),
  NP('tansen', 'Tansen', 'Lumbini', 27.8667, 83.55, 1371),
  NP('ghorahi', 'Ghorahi', 'Lumbini', 28.05, 82.4833, 634),
  NP('tulsipur', 'Tulsipur', 'Lumbini', 28.1306, 82.2972, 720),
  NP('lumbini', 'Lumbini', 'Lumbini', 27.4833, 83.2764, 107),
  NP('kapilvastu', 'Taulihawa', 'Lumbini', 27.55, 83.05, 100),
  NP('sandhikharka', 'Sandhikharka', 'Lumbini', 27.9667, 83.1167, 1341),
  NP('salyan', 'Salyan', 'Lumbini', 28.3833, 82.1667, 1457),
  NP('rolpa', 'Liwang', 'Lumbini', 28.2833, 82.6333, 1250),
  NP('pyuthan', 'Pyuthan', 'Lumbini', 28.1, 82.8667, 1250),
  NP('gulmi', 'Tamghas', 'Lumbini', 28.0667, 83.25, 1500),

  /* Karnali ------------------------------------------------------------ */
  NP('surkhet', 'Birendranagar (Surkhet)', 'Karnali', 28.6, 81.6333, 700),
  NP('jumla', 'Jumla', 'Karnali', 29.2747, 82.1838, 2540),
  NP('dailekh', 'Dailekh', 'Karnali', 28.85, 81.7167, 1400),
  NP('jajarkot', 'Khalanga', 'Karnali', 28.7, 82.2, 1300),
  NP('dolpa', 'Dunai', 'Karnali', 28.9333, 82.9, 2100),
  NP('humla', 'Simikot', 'Karnali', 29.9667, 81.8167, 2910),
  NP('mugu', 'Gamgadhi', 'Karnali', 29.4833, 82.2, 2100),
  NP('kalikot', 'Manma', 'Karnali', 29.15, 81.6167, 1500),
  NP('rukum', 'Musikot', 'Karnali', 28.6167, 82.4833, 1400),

  /* Sudurpashchim ------------------------------------------------------- */
  NP('dhangadhi', 'Dhangadhi', 'Sudurpashchim', 28.6833, 80.6, 179),
  NP('mahendranagar', 'Bhimdatta (Mahendranagar)', 'Sudurpashchim', 28.9644, 80.1811, 205),
  NP('dadeldhura', 'Dadeldhura', 'Sudurpashchim', 29.3, 80.5833, 1870),
  NP('doti', 'Dipayal Silgadhi', 'Sudurpashchim', 29.2667, 80.9333, 610),
  NP('baitadi', 'Baitadi', 'Sudurpashchim', 29.5333, 80.4667, 1600),
  NP('darchula', 'Darchula', 'Sudurpashchim', 29.85, 80.55, 940),
  NP('bajhang', 'Chainpur', 'Sudurpashchim', 29.5333, 81.2167, 1300),
  NP('bajura', 'Martadi', 'Sudurpashchim', 29.5, 81.5167, 1550),
  NP('achham', 'Mangalsen', 'Sudurpashchim', 29.1333, 81.2833, 1400),
  NP('tikapur', 'Tikapur', 'Sudurpashchim', 28.5167, 81.1167, 150),

  /* Where Nepalis are born abroad ---------------------------------------- */
  {
    id: 'delhi', name: 'Delhi', region: 'India',
    latitude: 28.6139, longitude: 77.209, utcOffsetMinutes: 330, elevation: 216,
  },
  {
    id: 'kolkata', name: 'Kolkata', region: 'India',
    latitude: 22.5726, longitude: 88.3639, utcOffsetMinutes: 330, elevation: 9,
  },
  {
    id: 'darjeeling', name: 'Darjeeling', region: 'India',
    latitude: 27.041, longitude: 88.2663, utcOffsetMinutes: 330, elevation: 2042,
  },
  {
    id: 'gangtok', name: 'Gangtok', region: 'India',
    latitude: 27.3314, longitude: 88.6138, utcOffsetMinutes: 330, elevation: 1650,
  },
  {
    id: 'doha', name: 'Doha', region: 'Qatar',
    latitude: 25.2854, longitude: 51.531, utcOffsetMinutes: 180, elevation: 10,
  },
  {
    id: 'dubai', name: 'Dubai', region: 'UAE',
    latitude: 25.2048, longitude: 55.2708, utcOffsetMinutes: 240, elevation: 5,
  },
  {
    id: 'kualalumpur', name: 'Kuala Lumpur', region: 'Malaysia',
    latitude: 3.139, longitude: 101.6869, utcOffsetMinutes: 480, elevation: 56,
  },
  {
    id: 'seoul', name: 'Seoul', region: 'South Korea',
    latitude: 37.5665, longitude: 126.978, utcOffsetMinutes: 540, elevation: 38,
  },
  {
    id: 'tokyo', name: 'Tokyo', region: 'Japan',
    latitude: 35.6762, longitude: 139.6503, utcOffsetMinutes: 540, elevation: 40,
  },
  {
    id: 'riyadh', name: 'Riyadh', region: 'Saudi Arabia',
    latitude: 24.7136, longitude: 46.6753, utcOffsetMinutes: 180, elevation: 612,
  },
  {
    id: 'london', name: 'London', region: 'United Kingdom',
    latitude: 51.5074, longitude: -0.1278, utcOffsetMinutes: 0, elevation: 11,
  },
  {
    id: 'newyork', name: 'New York', region: 'United States',
    latitude: 40.7128, longitude: -74.006, utcOffsetMinutes: -300, elevation: 10,
  },
  {
    id: 'sydney', name: 'Sydney', region: 'Australia',
    latitude: -33.8688, longitude: 151.2093, utcOffsetMinutes: 600, elevation: 58,
  },
];

/** Case-insensitive prefix and substring search, best matches first. */
export function searchPlaces(query: string, limit = 12): Place[] {
  const needle = query.trim().toLowerCase();
  if (!needle) return PLACES.slice(0, limit);

  const starts: Place[] = [];
  const contains: Place[] = [];
  for (const place of PLACES) {
    const name = place.name.toLowerCase();
    if (name.startsWith(needle)) starts.push(place);
    else if (name.includes(needle) || place.region.toLowerCase().includes(needle)) {
      contains.push(place);
    }
  }
  return [...starts, ...contains].slice(0, limit);
}

/**
 * The place a stored birth-place string refers to.
 *
 * Profiles saved before the picker existed hold free text, so an exact id
 * match is tried first, then the name, and Kathmandu stands in when neither
 * resolves — the chart is still drawn, and the screen says which place it used.
 */
export function resolvePlace(value: string | null | undefined): Place {
  if (!value) return KATHMANDU;
  const needle = value.trim().toLowerCase();
  if (!needle) return KATHMANDU;

  return (
    PLACES.find((place) => place.id === needle) ??
    PLACES.find((place) => place.name.toLowerCase() === needle) ??
    PLACES.find((place) => place.name.toLowerCase().startsWith(needle)) ??
    KATHMANDU
  );
}
