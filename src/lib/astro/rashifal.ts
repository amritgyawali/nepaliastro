/**
 * Rashifal — the daily, weekly, monthly and yearly reading for each sign.
 *
 * This is the page that brings people back every morning, and the one most
 * often written by hand months in advance and recycled. Here every line is
 * derived from where the grahas actually are on the day asked for, counted
 * from the sign being read. Two consequences follow, and both are the point:
 * the same sign reads differently on different days, and two signs read
 * differently on the same day, because the transits genuinely differ.
 */
import { GRAHAS, type GrahaId } from './ephemeris';
import { RASHIS, friendshipBetween, nakshatraAt } from './signs';
import { panchangFor } from './panchang';
import { luckyForRashi, GRAHA_TRAITS } from './lucky';
import { addDays, startOfNepaliDay, VARA } from './time';
import { gocharSummary, transitsFrom, nextSignChange, type TransitReading } from './transit';
import { siderealLongitude } from './ephemeris';

export type Period = 'daily' | 'weekly' | 'monthly' | 'yearly';

export type RashifalSection = {
  title: string;
  body: string;
  /** 1–5, for the star row a horoscope page shows. */
  rating: number;
};

export type Rashifal = {
  rashi: string;
  np: string;
  western: string;
  glyph: string;
  lord: GrahaId;
  period: Period;
  date: Date;
  /** 0–100 overall. */
  score: number;
  headline: string;
  sections: RashifalSection[];
  luckyColours: string[];
  luckySwatch: string[];
  luckyNumbers: number[];
  luckyDirection: string;
  /** The transits this reading was actually built from. */
  basis: TransitReading[];
};

/* ------------------------------------------------------------------ *
 * Phrasing
 * ------------------------------------------------------------------ */

/** What a house means when a graha is passing through it, for each area. */
const HOUSE_LINES: Record<number, { love: string; career: string; money: string; health: string }> = {
  1: { love: 'you set the tone, and others follow it', career: 'you are visible — say the thing you have been holding back', money: 'spending follows mood today, so watch it', health: 'energy is your own to spend; do not spend all of it' },
  2: { love: 'family has opinions about your private life', career: 'what you say carries further than what you do', money: 'money comes in through something already in motion', health: 'throat, teeth and appetite want attention' },
  3: { love: 'a message or a short journey changes something', career: 'courage matters more than preparation', money: 'a small, quick gain rather than a large one', health: 'shoulders and nerves; rest the hands' },
  4: { love: 'home is where the feeling is, for better or worse', career: 'work from where you are settled, not where you are expected', money: 'property, rent or the household budget comes up', health: 'chest and sleep; the mind wants quiet' },
  5: { love: 'the warmest placing there is — say what you feel', career: 'creative work goes further than routine work', money: 'a gamble may tempt you; take the small version', health: 'stomach and heart; good spirits carry the body' },
  6: { love: 'small frictions, none of them really about love', career: 'competition suits you — this is where rivals lose', money: 'debts and bills, but also the discipline to clear them', health: 'the week’s weak point; treat symptoms early' },
  7: { love: 'the other person moves first, and it is worth letting them', career: 'partnership and negotiation, not solo effort', money: 'money arrives through someone else’s decision', health: 'lower back and kidneys; balance the day' },
  8: { love: 'something unsaid comes out, and it needs handling gently', career: 'delays that are not your fault — do not force them', money: 'joint accounts, insurance, inheritance, tax', health: 'be careful physically; this is not a week for risk' },
  9: { love: 'distance, travel or difference in background is the theme', career: 'a mentor, a teacher or an elder opens something', money: 'fortune favours the honest route', health: 'thighs and hips; long walks do more than rest' },
  10: { love: 'work takes the time love wanted', career: 'the strongest placing for standing and recognition', money: 'earnings rise through position rather than effort', health: 'knees and joints; the load is on your back' },
  11: { love: 'friends make the introduction', career: 'networks pay off; ask for what you want', money: 'the house of gain — income arrives, often unexpectedly', health: 'ankles and circulation; keep moving' },
  12: { love: 'you need solitude more than company', career: 'work behind the scenes, and abroad if it is offered', money: 'expense, and some of it worth it', health: 'sleep, feet and eyes; withdraw and recover' },
};

/** The four areas a rashifal always covers, and which grahas speak to each. */
const AREAS: { key: 'love' | 'career' | 'money' | 'health'; title: string; grahas: GrahaId[] }[] = [
  { key: 'love', title: 'Love and family', grahas: ['venus', 'moon'] },
  { key: 'career', title: 'Work and study', grahas: ['sun', 'saturn', 'mercury'] },
  { key: 'money', title: 'Money', grahas: ['jupiter', 'mercury'] },
  { key: 'health', title: 'Health', grahas: ['mars', 'moon', 'saturn'] },
];

/** Which grahas drive which period — fast ones for a day, slow ones for a year. */
const PERIOD_DRIVERS: Record<Period, GrahaId[]> = {
  daily: ['moon', 'sun', 'mercury', 'venus', 'mars'],
  weekly: ['sun', 'mercury', 'venus', 'mars', 'moon'],
  monthly: ['sun', 'mars', 'venus', 'mercury', 'jupiter'],
  yearly: ['jupiter', 'saturn', 'rahu', 'ketu'],
};

function ratingFrom(favourableCount: number, total: number): number {
  if (total === 0) return 3;
  const share = favourableCount / total;
  return Math.max(1, Math.min(5, Math.round(share * 4) + 1));
}

/* ------------------------------------------------------------------ *
 * The day's own flavour
 * ------------------------------------------------------------------ */

type DayFactor = { delta: number; lines: string[] };

/**
 * What changes from one day to the next.
 *
 * The moon holds a sign for two and a half days, so transits alone would give
 * a sign the same reading three mornings running. The things that actually
 * turn over daily are the weekday's lord, the nakshatra the moon is crossing
 * and the tithi — and a Nepali reader checks all three anyway. Each is
 * weighed against the sign's own lord, which is why the same day reads
 * differently for Mesha and for Tula.
 */
function dayFactor(rashiIndex: number, at: Date): DayFactor {
  const rashi = RASHIS[rashiIndex];
  const panchang = panchangFor(at);
  const lines: string[] = [];
  let delta = 0;

  // The weekday's lord against the sign's lord.
  const dayLord = VARA[panchang.date.getDay()].lord.toLowerCase() as GrahaId;
  const toDayLord = friendshipBetween(rashi.lord, dayLord);
  if (dayLord === rashi.lord) {
    delta += 10;
    lines.push(`${VARA[panchang.date.getDay()].en} is ruled by ${GRAHAS[dayLord].vedic}, your own sign lord — your strongest weekday`);
  } else if (toDayLord === 'friend') {
    delta += 7;
    lines.push(`${GRAHAS[dayLord].vedic} rules today and is a friend of your lord ${GRAHAS[rashi.lord].vedic}`);
  } else if (toDayLord === 'enemy') {
    delta -= 7;
    lines.push(`${GRAHAS[dayLord].vedic} rules today and sits at odds with your lord ${GRAHAS[rashi.lord].vedic} — push nothing`);
  }

  // The nakshatra the moon is crossing, which turns over about once a day.
  const star = nakshatraAt(siderealLongitude('moon', at));
  const toStarLord = friendshipBetween(rashi.lord, star.meta.lord);
  if (toStarLord === 'friend' || star.meta.lord === rashi.lord) {
    delta += 6;
    lines.push(`The moon crosses ${star.meta.name}, whose lord ${GRAHAS[star.meta.lord].vedic} is well disposed to you`);
  } else if (toStarLord === 'enemy') {
    delta -= 6;
    lines.push(`The moon crosses ${star.meta.name} under ${GRAHAS[star.meta.lord].vedic} — a day to keep plans modest`);
  } else {
    lines.push(`The moon crosses ${star.meta.name}`);
  }

  // The tithi, which every muhurta weighs.
  if ([4, 9, 14].includes(panchang.tithi.within)) {
    delta -= 5;
    lines.push(`${panchang.tithi.name} is a Rikta tithi — begin nothing new`);
  } else if (panchang.tithi.name === 'Amavasya') {
    delta -= 4;
    lines.push('Amavasya — a day for the ancestors rather than for new work');
  } else if (panchang.tithi.name === 'Purnima') {
    delta += 5;
    lines.push('Purnima — the moon is full and the day carries further');
  }
  if (panchang.karana.vishti) {
    delta -= 5;
    lines.push('Vishti (Bhadra) karana runs today');
  }

  return { delta, lines };
}

/* ------------------------------------------------------------------ *
 * Building a reading
 * ------------------------------------------------------------------ */

/**
 * The reading for one sign, over one period.
 *
 * The date the transits are read at depends on the period: today for a daily
 * reading, the middle of the span for anything longer, so a monthly reading
 * describes the month rather than its first morning.
 */
export function rashifalFor(
  rashiIndex: number,
  period: Period = 'daily',
  at: Date = new Date(),
): Rashifal {
  const rashi = RASHIS[rashiIndex];
  const midpoint =
    period === 'daily' ? at
      : period === 'weekly' ? addDays(at, 3)
        : period === 'monthly' ? addDays(at, 15)
          : addDays(at, 180);

  const all = transitsFrom(rashiIndex, midpoint);
  const byGraha = Object.fromEntries(all.map((t) => [t.graha, t])) as Record<GrahaId, TransitReading>;
  const drivers = PERIOD_DRIVERS[period].map((id) => byGraha[id]);
  const summary = gocharSummary(all);

  // The overall score leans on the grahas that matter for this length of
  // time, not on all nine equally.
  const driverScore =
    drivers.filter((d) => d.favourable).length / Math.max(1, drivers.length);
  // A daily reading leans on the day's own panchang; a yearly one ignores it.
  const factor = period === 'daily' ? dayFactor(rashiIndex, at) : { delta: 0, lines: [] };
  const score = Math.max(
    0,
    Math.min(100, Math.round(driverScore * 55 + ((summary.balance + 100) / 200) * 35 + factor.delta)),
  );

  const sections: RashifalSection[] = AREAS.map((area) => {
    const relevant = area.grahas.map((id) => byGraha[id]);
    const lead = relevant[0];
    const lines = HOUSE_LINES[lead.house] ?? HOUSE_LINES[1];
    const favourableCount = relevant.filter((r) => r.favourable).length;

    const supporting = relevant
      .slice(1)
      .map((r) =>
        r.favourable
          ? `${GRAHAS[r.graha].vedic} supports from the ${r.house}th`
          : `${GRAHAS[r.graha].vedic} pulls against it from the ${r.house}th`,
      )
      .join(', ');

    return {
      title: area.title,
      body: `${GRAHAS[lead.graha].vedic} is in your ${lead.house}th — ${lines[area.key]}. ${supporting}.`,
      rating: ratingFrom(favourableCount, relevant.length),
    };
  });

  if (factor.lines.length) {
    sections.unshift({
      title: 'Today in particular',
      body: `${factor.lines.join('. ')}.`,
      rating: factor.delta > 4 ? 4 : factor.delta < -4 ? 2 : 3,
    });
  }

  // A timing note, which is what turns a horoscope into something usable.
  const timing = timingNote(period, midpoint, rashiIndex, byGraha);
  if (timing) sections.push(timing);

  const lucky = luckyForRashi(rashiIndex);
  const traits = GRAHA_TRAITS[rashi.lord];

  return {
    rashi: rashi.vedic,
    np: rashi.np,
    western: rashi.western,
    glyph: rashi.glyph,
    lord: rashi.lord,
    period,
    date: startOfNepaliDay(at),
    score,
    headline: headlineFor(period, score, byGraha, rashi.vedic, factor),
    sections,
    luckyColours: lucky.colours,
    luckySwatch: lucky.swatch,
    luckyNumbers: lucky.numbers,
    luckyDirection: traits.direction,
    basis: drivers,
  };
}

function headlineFor(
  period: Period,
  score: number,
  byGraha: Record<GrahaId, TransitReading>,
  rashiName: string,
  factor: DayFactor,
): string {
  // On a day whose own panchang is decisive, lead with that rather than with
  // a transit that has not moved since yesterday.
  if (period === 'daily' && Math.abs(factor.delta) >= 10 && factor.lines.length) {
    return factor.delta > 0
      ? `A good day for ${rashiName}. ${factor.lines[0]}.`
      : `Tread lightly, ${rashiName}. ${factor.lines[0]}.`;
  }

  const strongest = PERIOD_DRIVERS[period]
    .map((id) => byGraha[id])
    .find((t) => t.favourable);
  const weakest = PERIOD_DRIVERS[period]
    .map((id) => byGraha[id])
    .find((t) => !t.favourable);

  if (score >= 70 && strongest) {
    return `A strong ${period === 'daily' ? 'day' : period.replace('ly', '')} for ${rashiName} — ${GRAHAS[strongest.graha].vedic} in your ${strongest.house}th is doing the work.`;
  }
  if (score <= 40 && weakest) {
    return `Go carefully. ${GRAHAS[weakest.graha].vedic} in your ${weakest.house}th is the one to plan around.`;
  }
  return `A mixed picture for ${rashiName} — ${strongest ? `${GRAHAS[strongest.graha].vedic} helps` : 'little is pushing'}${weakest ? `, ${GRAHAS[weakest.graha].vedic} does not` : ''}.`;
}

/**
 * When the picture changes.
 *
 * For a day that means the moon's next sign change; for a year, Jupiter's.
 * A reading that says only "this month is difficult" is less useful than one
 * that says which day it stops being difficult.
 */
function timingNote(
  period: Period,
  at: Date,
  rashiIndex: number,
  byGraha: Record<GrahaId, TransitReading>,
): RashifalSection | null {
  const graha: GrahaId = period === 'daily' ? 'moon' : period === 'yearly' ? 'jupiter' : 'sun';
  const change = nextSignChange(graha, at);
  if (!change) return null;

  const current = byGraha[graha];
  const nextHouse = (current.house % 12) + 1;

  const when =
    period === 'daily'
      ? change.toLocaleString('en-GB', { weekday: 'long', hour: 'numeric', minute: '2-digit' })
      : change.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

  return {
    title: 'When it shifts',
    body: `${GRAHAS[graha].vedic} moves into your ${nextHouse}th on ${when}, and the emphasis moves with it.`,
    rating: 3,
  };
}

/** All twelve signs for a period — the listing page. */
export function allRashifal(period: Period = 'daily', at: Date = new Date()): Rashifal[] {
  return RASHIS.map((r) => rashifalFor(r.index, period, at));
}

/**
 * The line the home screen opens with.
 *
 * It names the day's panchang rather than the reader's sign, because it is
 * shown before anyone has chosen one.
 */
export function todayHeadline(at: Date = new Date()): string {
  const panchang = panchangFor(at);
  const weekday = VARA[panchang.date.getDay()];
  return `${weekday.en}, ${panchang.tithi.paksha} ${panchang.tithi.name} — the moon is in ${panchang.nakshatra.meta.name}, and ${GRAHAS[weekday.lord.toLowerCase() as GrahaId].vedic} rules the day.`;
}
