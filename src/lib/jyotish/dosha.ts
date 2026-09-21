/**
 * Doshas — the afflictions people actually come to ask about.
 *
 * Manglik, Kaal Sarp and Sade Sati are the three that decide marriages and
 * cause sleepless nights in Nepal, so each is detected from the real chart
 * with the classical cancellation rules applied rather than reported as a
 * flat yes or no. A dosha that is cancelled is still worth naming — people
 * have usually been told they have it — but it should be reported as
 * cancelled, with the reason, because that is the useful answer.
 */
import { siderealLongitude, type GrahaId } from './ephemeris';
import { GRAHAS } from './ephemeris';
import { RASHIS } from './signs';
import type { Chart } from './chart';

export type Severity = 'none' | 'cancelled' | 'mild' | 'moderate' | 'severe';

export type Dosha = {
  id: string;
  name: string;
  np: string;
  present: boolean;
  severity: Severity;
  /** What was found in the chart, in plain words. */
  finding: string;
  /** Classical rules that reduce or cancel it, and which ones applied. */
  cancellations: string[];
  effects: string[];
  remedies: string[];
};

/* ------------------------------------------------------------------ *
 * Mangal dosha
 * ------------------------------------------------------------------ */

/** The houses Mars afflicts when it sits in them. */
const MANGLIK_HOUSES = [1, 2, 4, 7, 8, 12];

/**
 * Mangal dosha, checked from the lagna, the moon and Venus.
 *
 * Counting from all three references is the stricter and more honest reading:
 * a Mars that is innocent from the ascendant can still sit in the seventh
 * from the moon, and most Nepali astrologers will check it that way before
 * passing a match.
 */
export function mangalDosha(chart: Chart): Dosha {
  const mars = chart.grahas.mars;
  const moonHouse = ((mars.rashi - chart.grahas.moon.rashi + 12) % 12) + 1;
  const venusHouse = ((mars.rashi - chart.grahas.venus.rashi + 12) % 12) + 1;

  const fromLagna = MANGLIK_HOUSES.includes(mars.house);
  const fromMoon = MANGLIK_HOUSES.includes(moonHouse);
  const fromVenus = MANGLIK_HOUSES.includes(venusHouse);
  const count = [fromLagna, fromMoon, fromVenus].filter(Boolean).length;

  const references: string[] = [];
  if (fromLagna) references.push(`${mars.house}th from the lagna`);
  if (fromMoon) references.push(`${moonHouse}th from the moon`);
  if (fromVenus) references.push(`${venusHouse}th from Venus`);

  // The classical exemptions. Each one is a real rule, not a softener.
  const cancellations: string[] = [];
  if (['Own sign', 'Exalted', 'Moolatrikona'].includes(mars.dignity)) {
    cancellations.push(`Mars is ${mars.dignity.toLowerCase()} in ${RASHIS[mars.rashi].vedic}, so it owns the house it sits in and does not spoil it`);
  }
  const jupiter = chart.grahas.jupiter;
  if (jupiter.rashi === mars.rashi) {
    cancellations.push('Jupiter sits with Mars, and its aspect restrains it');
  } else if (jupiter.aspects.includes(mars.house)) {
    cancellations.push('Jupiter aspects Mars, which is the strongest single cancellation');
  }
  if (chart.grahas.moon.rashi === mars.rashi) {
    cancellations.push('The moon sits with Mars, softening it');
  }
  // Mars in a sign that neutralises it for the specific house it occupies.
  const houseExemptions: Record<number, number[]> = {
    1: [0, 7], 2: [2, 5], 4: [0, 7], 7: [3, 9], 8: [8, 11], 12: [1, 6],
  };
  if (houseExemptions[mars.house]?.includes(mars.rashi)) {
    cancellations.push(`Mars in ${RASHIS[mars.rashi].vedic} is exempt in the ${mars.house}th house by the classical table`);
  }

  const present = count > 0;
  let severity: Severity = 'none';
  if (present) {
    if (cancellations.length > 0) severity = 'cancelled';
    else if (count === 3) severity = 'severe';
    else if (count === 2) severity = 'moderate';
    else severity = 'mild';
  }

  return {
    id: 'mangal',
    name: 'Mangal Dosha',
    np: 'मंगल दोष',
    present,
    severity,
    finding: present
      ? `Mars falls in the ${references.join(', the ')} — ${count} of the three references.`
      : 'Mars sits clear of the first, second, fourth, seventh, eighth and twelfth from all three references.',
    cancellations,
    effects: present
      ? [
          'Friction and delay in marriage, more in the arranging than the living',
          'A temper that arrives fast and leaves fast',
          'Best matched with a partner who also carries it, which cancels it outright',
        ]
      : [],
    remedies: present
      ? [
          'Hanuman Chalisa on Tuesdays, and a visit to a Hanuman temple',
          'Red masoor dal or red cloth given away on a Tuesday',
          'Mangal Shanti puja before fixing a marriage date',
          'Marry a partner whose chart carries the same dosha — the standard cure',
        ]
      : [],
  };
}

/* ------------------------------------------------------------------ *
 * Kaal Sarp dosha
 * ------------------------------------------------------------------ */

/** The twelve named forms, by the house Rahu occupies. */
const KAAL_SARP_TYPES = [
  'Anant', 'Kulik', 'Vasuki', 'Shankhpal', 'Padma', 'Mahapadma',
  'Takshak', 'Karkotak', 'Shankhachud', 'Ghatak', 'Vishdhar', 'Sheshnag',
];

/**
 * Kaal Sarp — every graha caught on one side of the nodal axis.
 *
 * Rahu and Ketu sit exactly opposite, cutting the zodiac in two. When the
 * other seven all fall in one half, the chart is said to be swallowed. A
 * single graha outside the arc breaks it, and a graha sitting on the axis
 * itself makes it partial — both are checked here rather than waved away.
 */
export function kaalSarpDosha(chart: Chart): Dosha {
  const rahu = chart.grahas.rahu.longitude;
  const others: GrahaId[] = ['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn'];

  // Measure every graha as an arc travelled forward from Rahu. Everything
  // under 180° lies in the half Rahu leads; everything over lies behind Ketu.
  const arcs = others.map((id) => ({
    id,
    arc: (chart.grahas[id].longitude - rahu + 360) % 360,
  }));

  const leading = arcs.filter((a) => a.arc > 0 && a.arc < 180);
  const trailing = arcs.filter((a) => a.arc > 180);
  const onAxis = arcs.filter((a) => a.arc <= 0.5 || Math.abs(a.arc - 180) <= 0.5);

  const complete = (leading.length === 7 || trailing.length === 7) && onAxis.length === 0;
  const partial = !complete && (leading.length === 6 || trailing.length === 6);

  const escaped = complete
    ? []
    : (leading.length > trailing.length ? trailing : leading).map(
        (a) => GRAHAS[a.id].vedic,
      );

  const type = KAAL_SARP_TYPES[chart.grahas.rahu.house - 1];

  const cancellations: string[] = [];
  if (partial) cancellations.push(`${escaped.join(' and ')} stands outside the axis, which breaks the full yoga`);
  if (complete && chart.grahas.jupiter.aspects.includes(chart.grahas.rahu.house)) {
    cancellations.push('Jupiter aspects Rahu, which is held to lift much of the weight');
  }

  return {
    id: 'kaalsarp',
    name: complete ? `${type} Kaal Sarp Dosha` : 'Kaal Sarp Dosha',
    np: 'कालसर्प दोष',
    present: complete || partial,
    severity: complete ? (cancellations.length ? 'moderate' : 'severe') : partial ? 'mild' : 'none',
    finding: complete
      ? `All seven grahas fall between Rahu and Ketu, with Rahu in the ${chart.grahas.rahu.house}th house — the ${type} form.`
      : partial
        ? `Six of the seven grahas are caught between the nodes; ${escaped.join(' and ')} falls outside.`
        : 'The grahas fall on both sides of the Rahu–Ketu axis, so there is no Kaal Sarp yoga.',
    cancellations,
    effects: complete || partial
      ? [
          'Effort meets delay — results arrive, but later than they should',
          'Sudden reversals, and a sense of an unseen hand in them',
          'Strong intuition, and unusually vivid dreams',
        ]
      : [],
    remedies: complete || partial
      ? [
          'Kaal Sarp Shanti puja, traditionally at Trishakti or Pashupatinath',
          'Rudrabhishek on a Monday of Shrawan',
          'Feed and do not harm serpents; offer milk at a Nag shrine on Nag Panchami',
          'Keep a Nag–Nagin silver pair after a proper puja',
        ]
      : [],
  };
}

/* ------------------------------------------------------------------ *
 * Sade Sati
 * ------------------------------------------------------------------ */

export type SadeSatiPhase = {
  phase: 'Rising' | 'Peak' | 'Setting';
  sign: string;
  from: Date;
  to: Date;
  about: string;
};

/** The instant Saturn enters a given sidereal sign, found by bisection. */
function saturnIngress(targetSign: number, after: Date): Date | null {
  const inSign = (at: Date) =>
    Math.floor(siderealLongitude('saturn', at) / 30) % 12 === targetSign;

  let low = after.getTime();
  const limit = low + 32 * 365.25 * 86400_000;
  const step = 5 * 86400_000;

  // Saturn takes about two and a half years to a sign, so a five-day scan
  // cannot step over one; retrogression can re-enter a sign, and the first
  // crossing is the one that counts.
  let found = -1;
  for (let t = low; t < limit; t += step) {
    if (inSign(new Date(t))) { found = t; break; }
  }
  if (found < 0) return null;

  let high = found;
  low = found - step;
  for (let i = 0; i < 40 && high - low > 3600_000; i += 1) {
    const mid = (low + high) / 2;
    if (inSign(new Date(mid))) high = mid;
    else low = mid;
  }
  return new Date(high);
}

/**
 * Sade Sati — Saturn's seven and a half years over the moon.
 *
 * Saturn crosses the sign before the moon's, then the moon's own, then the
 * one after: two and a half years each. The three phases have to be found as
 * one chain — each ingress searched from the end of the phase before it —
 * because searching for the three signs independently finds whichever
 * occurrence of each is nearest and splits a single cycle across decades.
 */
export function sadeSati(chart: Chart, from: Date = new Date()): {
  active: boolean;
  currentPhase: SadeSatiPhase | null;
  phases: SadeSatiPhase[];
  /** Saturn in the 4th or 8th from the moon — the lesser two-and-a-half. */
  dhaiya: boolean;
} {
  const moonSign = chart.grahas.moon.rashi;
  const saturnSign = Math.floor(siderealLongitude('saturn', from) / 30) % 12;
  const houseFromMoon = ((saturnSign - moonSign + 12) % 12) + 1;

  const active = [12, 1, 2].includes(houseFromMoon);
  const dhaiya = [4, 8].includes(houseFromMoon);

  const descriptors: { phase: SadeSatiPhase['phase']; offset: number; about: string }[] = [
    { phase: 'Rising', offset: 11, about: 'Pressure builds — expense, travel, disturbed sleep, a sense of things closing in' },
    { phase: 'Peak', offset: 0, about: 'The heaviest stretch — health, reputation and mood all tested at once' },
    { phase: 'Setting', offset: 1, about: 'The weight lifts slowly — money steadies, family matters settle' },
  ];

  /** One chained cycle: Saturn entering the 12th, then the 1st, then the 2nd. */
  const cycleFrom = (searchStart: Date): SadeSatiPhase[] => {
    const phases: SadeSatiPhase[] = [];
    let cursor = searchStart;

    for (const d of descriptors) {
      const sign = (moonSign + d.offset) % 12;
      const start = saturnIngress(sign, cursor);
      if (!start) break;
      const end =
        saturnIngress((sign + 1) % 12, new Date(start.getTime() + 86400_000)) ??
        new Date(start.getTime() + 2.5 * 365.25 * 86400_000);
      phases.push({ phase: d.phase, sign: RASHIS[sign].vedic, from: start, to: end, about: d.about });
      // The next phase can only begin once this one has ended.
      cursor = new Date(end.getTime() - 86400_000);
    }

    return phases;
  };

  // Begin a full cycle-length back so a sade sati already in progress is
  // caught from its true start rather than from today.
  let phases = cycleFrom(new Date(from.getTime() - 9 * 365.25 * 86400_000));

  // If that cycle is already over, the useful answer is the next one.
  const last = phases[phases.length - 1];
  if (last && last.to < from) {
    phases = cycleFrom(new Date(last.to.getTime() + 86400_000));
  }

  return {
    active,
    dhaiya,
    currentPhase: phases.find((p) => from >= p.from && from < p.to) ?? null,
    phases,
  };
}

/* ------------------------------------------------------------------ *
 * Gandmool and Pitru dosha
 * ------------------------------------------------------------------ */

/** The six nakshatras that straddle a sign joint — birth in one needs shanti. */
const GANDMOOL_NAKSHATRAS = [0, 8, 9, 17, 18, 26];

export function gandmoolDosha(chart: Chart): Dosha {
  const index = chart.nakshatra.index;
  const present = GANDMOOL_NAKSHATRAS.includes(index);

  // The joint is worst at the very edge of the nakshatra, where the moon is
  // leaving one sign's influence and has not yet entered the next.
  const severity: Severity = present
    ? chart.pada === 1 || chart.pada === 4
      ? 'moderate'
      : 'mild'
    : 'none';

  return {
    id: 'gandmool',
    name: 'Gandmool Dosha',
    np: 'गण्डमूल दोष',
    present,
    severity,
    finding: present
      ? `Born in ${chart.nakshatra.name}, pada ${chart.pada} — one of the six nakshatras that sit on a sign joint.`
      : `Born in ${chart.nakshatra.name}, which is not a gandmool nakshatra.`,
    cancellations: [],
    effects: present
      ? [
          'The first years of life can be unsettled, and often the father’s fortunes with them',
          'Once the shanti is done it is generally held to be finished',
        ]
      : [],
    remedies: present
      ? [
          'Gandmool Shanti puja on the same nakshatra, twenty-seven days after birth',
          'Worship of the nakshatra lord — ' + GRAHAS[chart.nakshatra.lord].vedic,
        ]
      : [],
  };
}

/**
 * Pitru dosha — the debt owed to the ancestors.
 *
 * Read from the ninth house, which is the father and the line behind him:
 * the sun or its lord afflicted there by Rahu, Ketu or Saturn is the classic
 * signature.
 */
export function pitruDosha(chart: Chart): Dosha {
  const ninth = chart.houses[8];
  const ninthLord = ninth.rashi.lord;
  const lordPosition = chart.grahas[ninthLord];

  const malefics: GrahaId[] = ['rahu', 'ketu', 'saturn'];
  const inNinth = malefics.filter((id) => chart.grahas[id].house === 9);
  const withSun = malefics.filter(
    (id) => chart.grahas[id].rashi === chart.grahas.sun.rashi,
  );
  // A malefic that happens to rule the ninth is not afflicting itself.
  const lordAfflicted = malefics.filter(
    (id) => id !== ninthLord && chart.grahas[id].rashi === lordPosition.rashi,
  );

  const signatures: string[] = [];
  if (inNinth.length) signatures.push(`${inNinth.map((id) => GRAHAS[id].vedic).join(' and ')} in the ninth house`);
  if (withSun.length) signatures.push(`the sun joined by ${withSun.map((id) => GRAHAS[id].vedic).join(' and ')}`);
  if (lordAfflicted.length) signatures.push(`the ninth lord ${GRAHAS[ninthLord].vedic} joined by ${lordAfflicted.map((id) => GRAHAS[id].vedic).join(' and ')}`);

  const present = signatures.length > 0;

  return {
    id: 'pitru',
    name: 'Pitru Dosha',
    np: 'पितृ दोष',
    present,
    severity: present ? (signatures.length >= 2 ? 'moderate' : 'mild') : 'none',
    finding: present
      ? `The ninth house carries ${signatures.join(', and ')}.`
      : 'The ninth house, its lord and the sun are all clear of Rahu, Ketu and Saturn.',
    cancellations: [],
    effects: present
      ? [
          'Obstruction that has no obvious cause, especially around children and property',
          'Unfinished business on the father’s side of the family',
        ]
      : [],
    remedies: present
      ? [
          'Shraddha and tarpan at the proper time, without skipping a year',
          'Pind daan, traditionally at Gaya or at Pashupatinath’s Bagmati ghats',
          'Feed crows and brahmins during Pitru Paksha',
        ]
      : [],
  };
}

/** Every dosha this app checks, in the order a report should read them. */
export function allDoshas(chart: Chart): Dosha[] {
  return [mangalDosha(chart), kaalSarpDosha(chart), gandmoolDosha(chart), pitruDosha(chart)];
}

