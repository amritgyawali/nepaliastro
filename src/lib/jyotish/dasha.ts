/**
 * Vimshottari dasha — the clock a Vedic chart runs on.
 *
 * A birth chart says what can happen; the dasha says when. The whole system
 * hangs off one number: how far the moon had travelled into its nakshatra at
 * the moment of birth. That fraction decides how much of the first period was
 * already spent, and every date for the next hundred and twenty years follows
 * from it — which is why "graha dasha herne" is the reading people actually
 * come for, and why an unknown birth time weakens it but does not break it.
 */
import type { GrahaId } from './ephemeris';
import { GRAHAS } from './ephemeris';
import { NAKSHATRA_SPAN, NAKSHATRAS } from './signs';
import type { Chart } from './chart';

/** The nine lords in their fixed order, with the years each one holds. */
const CYCLE: { lord: GrahaId; years: number }[] = [
  { lord: 'ketu', years: 7 },
  { lord: 'venus', years: 20 },
  { lord: 'sun', years: 6 },
  { lord: 'moon', years: 10 },
  { lord: 'mars', years: 7 },
  { lord: 'rahu', years: 18 },
  { lord: 'jupiter', years: 16 },
  { lord: 'saturn', years: 19 },
  { lord: 'mercury', years: 17 },
];

/** The cycle totals a hundred and twenty years — the name says so. */
export const TOTAL_YEARS = CYCLE.reduce((sum, step) => sum + step.years, 0);

/**
 * Days in a dasha year.
 *
 * The Julian year, 365.25 days, is the value the published dasha tables are
 * built on; using the calendar year instead drifts a period end by weeks over
 * a long mahadasha.
 */
const DAYS_PER_YEAR = 365.25;
const MS_PER_YEAR = DAYS_PER_YEAR * 86400_000;

function indexOfLord(lord: GrahaId): number {
  return CYCLE.findIndex((step) => step.lord === lord);
}

function yearsOf(lord: GrahaId): number {
  return CYCLE[indexOfLord(lord)].years;
}

export type DashaPeriod = {
  lord: GrahaId;
  lordName: string;
  lordNp: string;
  from: Date;
  to: Date;
  /** Length in years, for showing a bar. */
  years: number;
  /** Nested sub-periods; empty at the deepest level requested. */
  children: DashaPeriod[];
};

function makePeriod(lord: GrahaId, from: Date, years: number, children: DashaPeriod[] = []): DashaPeriod {
  return {
    lord,
    lordName: GRAHAS[lord].vedic,
    lordNp: GRAHAS[lord].np,
    from,
    to: new Date(from.getTime() + years * MS_PER_YEAR),
    years,
    children,
  };
}

/**
 * The sub-periods inside a period, at one level down.
 *
 * Each lord takes the same share of the parent that it takes of the whole
 * cycle, and they run in the same fixed order, starting with the parent's own
 * lord. The arithmetic is identical at every depth, so one function covers
 * antardasha, pratyantardasha and below.
 */
function subPeriods(
  parentLord: GrahaId,
  parentYears: number,
  from: Date,
  depth: number,
): DashaPeriod[] {
  const start = indexOfLord(parentLord);
  const periods: DashaPeriod[] = [];
  let cursor = from;

  for (let i = 0; i < 9; i += 1) {
    const step = CYCLE[(start + i) % 9];
    const years = (parentYears * step.years) / TOTAL_YEARS;
    const children = depth > 1 ? subPeriods(step.lord, years, cursor, depth - 1) : [];
    const period = makePeriod(step.lord, cursor, years, children);
    periods.push(period);
    cursor = period.to;
  }

  return periods;
}

export type DashaTree = {
  /** The nakshatra lord the sequence starts from. */
  startLord: GrahaId;
  /** Years of the first mahadasha still unspent at birth. */
  balanceYears: number;
  periods: DashaPeriod[];
};

/**
 * The whole dasha sequence for a chart.
 *
 * `depth` of 3 gives mahadasha, antardasha and pratyantardasha — the three
 * levels an astrologer quotes. Going deeper is possible and rarely useful.
 */
export function vimshottariDasha(chart: Chart, depth = 3): DashaTree {
  const moon = chart.grahas.moon.longitude;
  const nakshatraIndex = Math.floor(moon / NAKSHATRA_SPAN) % 27;
  const startLord = NAKSHATRAS[nakshatraIndex].lord;

  // How much of the birth nakshatra the moon had already crossed. The first
  // mahadasha is short by exactly that share.
  const travelled = (moon % NAKSHATRA_SPAN) / NAKSHATRA_SPAN;
  const fullYears = yearsOf(startLord);
  const balanceYears = fullYears * (1 - travelled);

  const periods: DashaPeriod[] = [];
  const start = indexOfLord(startLord);
  let cursor = chart.moment.at;

  for (let i = 0; i < 9; i += 1) {
    const step = CYCLE[(start + i) % 9];
    const years = i === 0 ? balanceYears : step.years;

    // The opening mahadasha is a fragment, so its antardashas are scaled to
    // the fragment but still begin from the lord that was running at birth.
    const children =
      depth > 1
        ? i === 0
          ? openingSubPeriods(step.lord, travelled, cursor, depth - 1)
          : subPeriods(step.lord, years, cursor, depth - 1)
        : [];

    const period = makePeriod(step.lord, cursor, years, children);
    periods.push(period);
    cursor = period.to;
  }

  return { startLord, balanceYears, periods };
}

/**
 * Sub-periods of the mahadasha already in progress at birth.
 *
 * The chart is born partway through: some antardashas are already over and
 * one is running. Laying the full set out from a notional start and then
 * clipping what precedes birth keeps every boundary where the tables put it,
 * instead of stretching the survivors to fill the gap.
 */
function openingSubPeriods(
  lord: GrahaId,
  travelled: number,
  birth: Date,
  depth: number,
): DashaPeriod[] {
  const fullYears = yearsOf(lord);
  const notionalStart = new Date(birth.getTime() - travelled * fullYears * MS_PER_YEAR);

  return subPeriods(lord, fullYears, notionalStart, depth)
    .filter((period) => period.to > birth)
    .map((period) =>
      period.from >= birth
        ? period
        : // The one running at birth starts at birth, as far as this life goes.
          { ...period, from: birth, children: period.children.filter((c) => c.to > birth) },
    );
}

export type RunningDasha = {
  maha: DashaPeriod;
  antar: DashaPeriod | null;
  pratyantar: DashaPeriod | null;
};

/** The periods running at a given moment, at each of the three levels. */
export function dashaAt(tree: DashaTree, at: Date = new Date()): RunningDasha | null {
  const maha = tree.periods.find((p) => at >= p.from && at < p.to);
  if (!maha) return null;

  const antar = maha.children.find((p) => at >= p.from && at < p.to) ?? null;
  const pratyantar = antar?.children.find((p) => at >= p.from && at < p.to) ?? null;

  return { maha, antar, pratyantar };
}

/**
 * How a dasha lord is likely to behave in this particular chart.
 *
 * A dasha is not good or bad in itself — it delivers whatever its lord is
 * capable of in the chart it belongs to. So the verdict reads the lord's own
 * dignity and house rather than quoting a fixed meaning for the planet.
 */
export function dashaVerdict(chart: Chart, lord: GrahaId): {
  tone: 'strong' | 'mixed' | 'testing';
  summary: string;
} {
  const graha = chart.grahas[lord];
  const kendra = [1, 4, 7, 10].includes(graha.house);
  const trikona = [1, 5, 9].includes(graha.house);
  const dusthana = [6, 8, 12].includes(graha.house);

  const tone: 'strong' | 'mixed' | 'testing' =
    graha.strength >= 70 && !dusthana
      ? 'strong'
      : graha.strength <= 35 || (dusthana && graha.strength < 60)
        ? 'testing'
        : 'mixed';

  const place = trikona
    ? 'a trine, where it can give freely'
    : kendra
      ? 'an angle, where it acts in the open'
      : dusthana
        ? 'a difficult house, so its results come through friction'
        : `the ${graha.house}th house`;

  const condition = graha.combust
    ? ', burnt by the sun and unable to act cleanly'
    : graha.retrograde && !graha.graha.shadow
      ? ', retrograde — strong, but turned inward'
      : '';

  return {
    tone,
    summary: `${GRAHAS[lord].vedic} is ${graha.dignity.toLowerCase()} in ${graha.nakshatraMeta.name}, in ${place}${condition}.`,
  };
}
