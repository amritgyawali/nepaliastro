/**
 * Self-test for the astrology engine.
 *
 * An astrology app fails silently: a chart drawn with the wrong ayanamsa or
 * an ascendant an hour out still looks like a chart, and nobody can tell by
 * reading it. So the things that can be checked against an outside authority
 * are checked here — published Lahiri values, real lunation times, the
 * festival dates Nepal actually kept in 2025 — alongside the invariants that
 * must hold whatever the date.
 *
 * Run it with:  npx tsx src/lib/astro/selftest.ts
 */
import { ascendantAt, buildChart } from './chart';
import { vimshottariDasha, dashaAt, TOTAL_YEARS } from './dasha';
import { ayanamsa, siderealLongitude, grahaPositions, GRAHA_ORDER } from './ephemeris';
import { festivalsIn } from './festivals';
import { matchCharts } from './matching';
import { findMuhurta, activityById, lagnaWindows } from './muhurta';
import { panchangFor, tithiAt } from './panchang';
import { KATHMANDU, resolvePlace } from './places';
import { rashifalFor } from './rashifal';
import { rashiAt } from './signs';
import { toBs, fromBs, toNepalSambat } from './bikram';
import { formatGregorian } from './time';

type Result = { name: string; pass: boolean; detail: string };
const results: Result[] = [];

function check(name: string, pass: boolean, detail: string) {
  results.push({ name, pass, detail });
}

/** Within `tolerance` of the expected value? */
function near(actual: number, expected: number, tolerance: number): boolean {
  return Math.abs(actual - expected) <= tolerance;
}

/* -- Ayanamsa against published Lahiri values ------------------------ */

// Lahiri is 23°51'11" at J2000 and moves about 50.3" a year. A tenth of a
// degree is far tighter than any boundary the chart reads.
for (const [year, expected] of [[1980, 23.5736], [2000, 23.8531], [2025, 24.2023]] as const) {
  const actual = ayanamsa(new Date(Date.UTC(year, 0, 1)));
  check(`Lahiri ayanamsa ${year}`, near(actual, expected, 0.01), `${actual.toFixed(4)}° vs ${expected}°`);
}

/* -- Sunrise and the ascendant --------------------------------------- */

// At sunrise the ascendant and the sun sit within a few degrees of each
// other, which is the cleanest check there is that the lagna maths is right.
{
  const p = panchangFor(new Date(Date.UTC(2026, 8, 21, 6, 0)));
  const sunrise = p.sunrise!;
  const asc = ascendantAt(sunrise, KATHMANDU);
  const sun = siderealLongitude('sun', sunrise);
  check(
    'Ascendant equals the sun at sunrise',
    near(((asc - sun + 540) % 360) - 180, 0, 3),
    `asc ${asc.toFixed(2)}° vs sun ${sun.toFixed(2)}°`,
  );
}

// Every sign must rise once in a day, in zodiacal order.
{
  const start = new Date(Date.UTC(2026, 8, 21));
  const seen: number[] = [];
  for (let m = 0; m < 1440; m += 10) {
    const sign = Math.floor(ascendantAt(new Date(start.getTime() + m * 60_000), KATHMANDU) / 30) % 12;
    if (seen[seen.length - 1] !== sign) seen.push(sign);
  }
  const ordered = seen.every((s, i) => i === 0 || s === (seen[i - 1] + 1) % 12);
  check('All 12 lagnas rise in order', seen.length >= 12 && ordered, `${seen.length} transitions`);
}

/* -- Tithi against real lunations ------------------------------------ */

// A tithi ends exactly at a syzygy, so Purnima must end at the full moon.
{
  const trueFullMoon = Date.UTC(2026, 8, 26, 16, 49);
  const t = tithiAt(new Date(trueFullMoon - 6 * 3600_000));
  check('Purnima runs before the full moon', t.name === 'Purnima', `${t.paksha} ${t.name}`);
  check(
    'Purnima ends at the full moon',
    Math.abs(t.endsAt.getTime() - trueFullMoon) < 4 * 60_000,
    `${t.endsAt.toISOString()} vs ${new Date(trueFullMoon).toISOString()}`,
  );
}

/* -- Bikram Sambat --------------------------------------------------- */

{
  // Nepali New Year 2081 fell on 13 April 2024.
  const ny = fromBs(2081, 1, 1);
  check(
    'BS 2081-01-01 is 13 April 2024',
    !!ny && ny.getFullYear() === 2024 && ny.getMonth() === 3 && ny.getDate() === 13,
    ny ? ny.toDateString() : 'null',
  );

  let mismatches = 0;
  for (let i = 0; i < 3000; i += 11) {
    const ad = new Date(1965, 0, 1 + i);
    const bs = toBs(ad);
    const back = bs && fromBs(bs.year, bs.month, bs.day);
    if (!back || back.toDateString() !== ad.toDateString()) mismatches += 1;
  }
  check('BS round-trips over 3000 days', mismatches === 0, `${mismatches} mismatches`);

  // Mha Puja 2025 was 22 October, opening Nepal Sambat 1146.
  const ns = toNepalSambat(new Date(Date.UTC(2025, 11, 1)));
  check(
    'Nepal Sambat 1146 begins 22 Oct 2025',
    ns.year === 1146 && ns.newYear.getMonth() === 9 && ns.newYear.getDate() === 22,
    `NS ${ns.year}, ${ns.newYear.toDateString()}`,
  );
}

/* -- Festivals against the dates Nepal actually kept in 2025 --------- */

{
  const expected: Record<string, string> = {
    maghesankranti: '14 January 2025',
    basantapanchami: '3 February 2025',
    shivaratri: '26 February 2025',
    ramnavami: '6 April 2025',
    nayabarsha: '14 April 2025',
    buddhajayanti: '12 May 2025',
    janaipurnima: '9 August 2025',
    gaijatra: '10 August 2025',
    janmashtami: '16 August 2025',
    teej: '26 August 2025',
    indrajatra: '6 September 2025',
    ghatasthapana: '22 September 2025',
    dashain: '2 October 2025',
    bhaitika: '23 October 2025',
  };

  const found = new Map(festivalsIn(2025).map((f) => [f.id, formatGregorian(f.date)]));
  for (const [id, want] of Object.entries(expected)) {
    const got = found.get(id);
    check(`Festival ${id}`, got === want, `${got ?? 'not found'} (expected ${want})`);
  }
}

/* -- Dasha ----------------------------------------------------------- */

{
  const chart = buildChart({
    at: new Date(Date.UTC(2006, 8, 19, 16, 11)),
    place: KATHMANDU,
    timeKnown: true,
  });
  const tree = vimshottariDasha(chart, 3);

  const spanYears =
    (tree.periods[8].to.getTime() - tree.periods[0].from.getTime()) / (365.25 * 86400_000);
  const startYears = { ketu: 7, venus: 20, sun: 6, moon: 10, mars: 7, rahu: 18, jupiter: 16, saturn: 19, mercury: 17 }[tree.startLord]!;
  check(
    'Dasha spans 120 years less the balance already spent',
    near(spanYears, TOTAL_YEARS - (startYears - tree.balanceYears), 0.01),
    `${spanYears.toFixed(4)} years`,
  );

  let gaps = 0;
  for (const maha of tree.periods) {
    for (let i = 1; i < maha.children.length; i += 1) {
      if (Math.abs(maha.children[i].from.getTime() - maha.children[i - 1].to.getTime()) > 1000) gaps += 1;
    }
  }
  check('Dasha periods tile without gaps', gaps === 0, `${gaps} gaps`);
  check('A dasha is running today', !!dashaAt(tree, new Date()), '');
}

/* -- Matching -------------------------------------------------------- */

{
  let bad = 0;
  for (let i = 0; i < 120; i += 1) {
    const a = buildChart({ at: new Date(Date.UTC(1980 + (i % 40), i % 12, 1 + (i % 28), i % 24)), place: KATHMANDU, timeKnown: true });
    const b = buildChart({ at: new Date(Date.UTC(1985 + ((i * 3) % 35), (i * 5) % 12, 1 + ((i * 11) % 28), (i * 13) % 24)), place: resolvePlace('Pokhara'), timeKnown: true });
    const m = matchCharts(a, b);
    if (m.total < 0 || m.total > 36) bad += 1;
    if (m.koots.some((k) => k.score < 0 || k.score > k.max)) bad += 1;
    if (m.koots.reduce((s, k) => s + k.max, 0) !== 36) bad += 1;
  }
  check('Ashtakoot totals stay within 0–36', bad === 0, `${bad} violations over 120 pairs`);
}

/* -- Muhurta --------------------------------------------------------- */

{
  const windows = lagnaWindows(new Date(Date.UTC(2026, 8, 21)), KATHMANDU);
  const total = windows.reduce((s, w) => s + (w.to.getTime() - w.from.getTime()), 0);
  check('Lagna windows tile a full day', Math.abs(total - 86400_000) < 60_000, `${(total / 3600_000).toFixed(3)}h`);

  // The best marriage days must land on the nakshatras the classics name.
  const marriage = activityById('marriage');
  const best = findMuhurta(marriage, { from: new Date(Date.UTC(2026, 10, 1)), days: 60 })
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);
  const allNamed = best.every((d) => marriage.nakshatras.includes(d.panchang.nakshatra.meta.index));
  check('Top marriage saits use marriage nakshatras', allNamed, best.map((d) => d.panchang.nakshatra.meta.name).join(', '));
}

/* -- Grahas and rashifal --------------------------------------------- */

{
  const positions = grahaPositions(new Date());
  const allValid = GRAHA_ORDER.every((id) => {
    const p = positions[id];
    return p.longitude >= 0 && p.longitude < 360 && p.rashi >= 0 && p.rashi < 12 && p.pada >= 1 && p.pada <= 4;
  });
  check('All nine grahas have valid positions', allValid, '');

  // Rahu and Ketu must sit exactly opposite each other: Ketu is defined as
  // Rahu plus half a circle, so the separation is 180° to the last decimal.
  const separation = (positions.ketu.longitude - positions.rahu.longitude + 360) % 360;
  check('Rahu and Ketu are exactly opposed', Math.abs(separation - 180) < 0.001, `${separation.toFixed(6)}° apart`);

  // The twelve signs must not all read alike.
  const scores = Array.from({ length: 12 }, (_, i) => rashifalFor(i, 'daily').score);
  check('Rashifal differs between signs', new Set(scores).size >= 4, `${new Set(scores).size} distinct scores`);

  // And the same sign must not read alike all week.
  const week = Array.from({ length: 7 }, (_, d) =>
    rashifalFor(0, 'daily', new Date(Date.now() + d * 86400_000)).score,
  );
  check('Rashifal differs between days', new Set(week).size >= 3, `${new Set(week).size} distinct scores`);
}

/* -- Report ---------------------------------------------------------- */

const failed = results.filter((r) => !r.pass);
for (const r of results) {
  console.log(`${r.pass ? 'PASS' : 'FAIL'}  ${r.name.padEnd(48)} ${r.detail}`);
}
console.log(`\n${results.length - failed.length}/${results.length} passed`);

if (failed.length) {
  console.log('\nFailures:');
  for (const f of failed) console.log(`  ${f.name}: ${f.detail}`);
  process.exitCode = 1;
}

export { results };
