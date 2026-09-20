/**
 * The reading a person is sent every five hours.
 *
 * Two things make a reading theirs rather than their sign's. The first is
 * their kundli: the moon sign, nakshatra and lagna already computed in
 * `kundli.ts`. The second is where the moon is *now* relative to that chart —
 * the house it is transiting from their natal moon, which is the oldest way of
 * answering "what about today, for me?" and is different for every rashi.
 *
 * Everything in `PredictionFacts` is computed from those two. The words are
 * then written either by the AI astrologer in `ai.ts` or, when no key is
 * configured or the call fails, by `composePrediction` here — which picks from
 * the banks below with a seed built from the person's own birth details, so two
 * people never receive the same sentence in the same window.
 */
import type { OnboardingProfile } from '@/store/onboarding';

import { dayKey, seededPick, seededRange } from './astro';
import { kundliFor, rashiAt, type Kundli, type Rashi } from './kundli';
import {
  nakshatraAt,
  siderealLongitudes,
  tithiFor,
  type Nakshatra,
  type Tithi,
} from './panchang';

/* ------------------------------------------------------------------ *
 * The five-hour cycle
 * ------------------------------------------------------------------ */

/**
 * The cycle, as local hours: 01:00, 06:00, 11:00, 16:00, 21:00. Five hours
 * apart all the way through the waking day, with the short gap left where
 * people are asleep. The 01:00 reading is only scheduled if the person asks
 * for it, which leaves four a day by default.
 */
export const SLOT_HOURS = [1, 6, 11, 16, 21] as const;

/** The overnight slot, skipped unless "wake me at night" is on. */
export const OVERNIGHT_HOUR = 1;

export type Phase = 'lateNight' | 'dawn' | 'midday' | 'afternoon' | 'evening';

const PHASES: Record<number, { key: Phase; label: string }> = {
  1: { key: 'lateNight', label: 'Late night' },
  6: { key: 'dawn', label: 'Early morning' },
  11: { key: 'midday', label: 'Late morning' },
  16: { key: 'afternoon', label: 'Afternoon' },
  21: { key: 'evening', label: 'Evening' },
};

export function slotHours(includeOvernight: boolean): number[] {
  return SLOT_HOURS.filter((hour) => includeOvernight || hour !== OVERNIGHT_HOUR);
}

/** That hour on that local day, to the minute. */
function slotAt(day: Date, hour: number): Date {
  return new Date(day.getFullYear(), day.getMonth(), day.getDate(), hour, 0, 0, 0);
}

function addDays(date: Date, days: number): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
}

/** The next `count` slot instants strictly after `from`. */
export function upcomingSlots(from: Date, count: number, includeOvernight: boolean): Date[] {
  const hours = slotHours(includeOvernight);
  const found: Date[] = [];

  for (let day = 0; day < 7 && found.length < count; day += 1) {
    for (const hour of hours) {
      const at = slotAt(addDays(from, day), hour);
      if (at.getTime() > from.getTime() && found.length < count) found.push(at);
    }
  }

  return found;
}

/** The slot the person is living in right now — the last one that has passed. */
export function currentSlot(from: Date, includeOvernight: boolean): Date {
  const hours = slotHours(includeOvernight);

  for (let day = 0; day < 2; day += 1) {
    for (const hour of [...hours].reverse()) {
      const at = slotAt(addDays(from, -day), hour);
      if (at.getTime() <= from.getTime()) return at;
    }
  }

  // Unreachable with any non-empty hour list, but the type has to be a Date.
  return slotAt(from, hours[0] ?? 6);
}

/** Stable per person per window, so a regenerated reading replaces its twin. */
export function predictionId(at: Date): string {
  return `${dayKey(at)}-${`${at.getHours()}`.padStart(2, '0')}`;
}

/* ------------------------------------------------------------------ *
 * What the reading is written from
 * ------------------------------------------------------------------ */

type House = {
  number: number;
  /** Classical name of the bhava. */
  name: string;
  /** What the house is about, in one phrase. */
  theme: string;
  /** Short label for a card, e.g. "Money and what you say". */
  focus: string;
  titles: readonly string[];
  advice: readonly string[];
};

const HOUSES: readonly House[] = [
  {
    number: 1,
    name: 'Tanu',
    theme: 'you, your body and the impression you make',
    focus: 'You and your health',
    titles: [
      'The day turns on how you show up',
      'Your own name is the subject today',
      'Lead with yourself this window',
      'Your own energy sets the terms today',
    ],
    advice: [
      'You are the subject of this window: what you decide now is what others will follow. Say it in your own words rather than sending someone else to say it.',
      'Your body is the honest instrument today. Eat on time, and the rest of the hours behave themselves.',
      'First impressions land harder than usual. Speak for the room you want to be in, not the one you are sitting in.',
      'Nothing here needs delegating. The work with your own name on it is the work that moves.',
    ],
  },
  {
    number: 2,
    name: 'Dhana',
    theme: 'money, family and what you say',
    focus: 'Money and what you say',
    titles: [
      'Money and words both carry weight',
      'Say the number out loud',
      'A family matter is ready to settle',
      'What you own is worth an honest hour',
    ],
    advice: [
      'Money owed to you is worth one polite reminder in this window. The tone you choose decides the answer more than the words do.',
      'What you say about money now gets quoted back to you. Name a figure only when you are ready to hold it.',
      'A family expense you keep postponing is cheaper handled today than next week.',
      'Food, family and savings share this house. A meal at home will do more for you than a meeting out.',
    ],
  },
  {
    number: 3,
    name: 'Sahaja',
    theme: 'courage, siblings, messages and short journeys',
    focus: 'Courage and conversations',
    titles: [
      'Send the message you have been drafting',
      'Short journeys go your way',
      'Courage is the cheaper option now',
      'The small brave thing, not the big plan',
    ],
    advice: [
      'The message you have rewritten three times is fine as it stands. Send it in this window rather than sleeping on it again.',
      'Short journeys and small errands are well placed. Group them together and the afternoon opens up.',
      'A brother, sister or cousin is the person to ask. They know the part of this you are missing.',
      'Say the smaller, truer thing rather than the impressive one. This house rewards nerve, not polish.',
    ],
  },
  {
    number: 4,
    name: 'Sukha',
    theme: 'home, your mother and peace of mind',
    focus: 'Home and peace of mind',
    titles: [
      'Home is where today is decided',
      'Settle the house, settle the day',
      'A quiet room is worth an hour of work',
      'Peace at home decides everything else',
    ],
    advice: [
      'The house itself wants attention — a repair, a bill, a room nobody has tidied. Half an hour here buys back a week.',
      'Call your mother, or whoever has held that place for you. The conversation you are avoiding is shorter than you think.',
      'Work from a quiet corner if you can. With the moon here, noise costs you more concentration than usual.',
      'Property, vehicles and paperwork about either are well placed now. Read before you sign, then sign.',
    ],
  },
  {
    number: 5,
    name: 'Putra',
    theme: 'study, children, romance and what you create',
    focus: 'Study, love and what you make',
    titles: [
      'Make something before the day makes you',
      'Study now, revise later',
      'A warm window for the people you love',
      'Your own work is the lucky work today',
    ],
    advice: [
      'New study goes in and stays in during this window. Start the difficult chapter rather than revising the easy one.',
      'What you make now carries your signature clearly. Do the creative part yourself and hand out the tidying.',
      'Children and younger people bring the useful remark today. Listen past the way they say it.',
      'Romance is well placed and takes little effort — a plan made now lands better than a grand one made later.',
    ],
  },
  {
    number: 6,
    name: 'Ari',
    theme: 'work, routine, health and what you owe',
    focus: 'Work, routine and health',
    titles: [
      'Routine beats inspiration in this window',
      'Clear one debt, small or large',
      'The dull task is the one that pays',
      'Health and habit ask for one hour',
    ],
    advice: [
      'This is a working window, not a visionary one. Clear the list in order and the day closes cleanly.',
      'A debt, a bill or an unanswered obligation is best dealt with now, while you still have the patience for it.',
      'Health responds to routine rather than effort — water, a real meal, and a walk you actually take.',
      'If someone is competing with you, let the work answer them. Argument here costs you the afternoon.',
    ],
  },
  {
    number: 7,
    name: 'Yuvati',
    theme: 'partners, marriage, agreements and the public',
    focus: 'Partners and agreements',
    titles: [
      'Partners take the lead this window',
      'An agreement is closer than it looks',
      'Let the other person speak first',
      'What you agree now will hold',
    ],
    advice: [
      'Let the other person speak first. What they open with tells you which half of the agreement is actually negotiable.',
      'A partner — at home or at work — is carrying something they have not said. Ask once, plainly.',
      'Agreements made in this window hold. Agreements argued in it do not, so settle the principle and leave the detail for tomorrow.',
      'You are more visible than you feel today. Say the thing you would be happy to have repeated.',
    ],
  },
  {
    number: 8,
    name: 'Randhra',
    theme: 'what is hidden, shared money and change',
    focus: 'Change and hidden things',
    titles: [
      'Something hidden comes up for air',
      'Ask the question you have been circling',
      'Change is easier than the fight against it',
      'Look under the thing you keep avoiding',
    ],
    advice: [
      'The fact you have not been told is findable in this window if you ask the plain question. Ask the person, not the room.',
      'Shared money — a loan, an inheritance, a joint account — deserves one honest look now rather than a worried one later.',
      'Do not force an outcome in these hours. What is ending is ending, and holding it costs more than letting it go.',
      'Research, repair and anything that needs the lid taken off go well. New beginnings do not.',
    ],
  },
  {
    number: 9,
    name: 'Dharma',
    theme: 'luck, teachers, your father and long journeys',
    focus: 'Luck, teachers and travel',
    titles: [
      'Luck sits with the one who asks',
      'A teacher is worth more than a plan',
      'Long journeys look kindly on you',
      'Ask the one who has walked it before',
    ],
    advice: [
      'Ask someone who has done this before you. The advice you get in this window saves a month of trial.',
      'Long journeys, visas, admissions and anything foreign are well placed. Take the next step rather than the whole staircase.',
      'Your father, or an elder who stands in for him, has a view worth hearing even if you already disagree with it.',
      'This is a generous window and it rewards honesty — say what you actually want rather than what sounds reasonable.',
    ],
  },
  {
    number: 10,
    name: 'Karma',
    theme: 'career, standing and the work you are known for',
    focus: 'Career and standing',
    titles: [
      'Your work is being watched today',
      'Ask for what the work has earned',
      'Standing is built in windows like this',
      'Finish the work that carries your name',
    ],
    advice: [
      'Your work is more visible than usual. Finish the piece that carries your name and let it be seen.',
      'This is the right window to ask a senior for something — a decision, a raise, a signature. Ask early in it.',
      'Do not take on a new obligation in public just to look willing. Standing is built by finishing, not by accepting.',
      'A senior or an authority is watching more closely than they let on. Steady beats brilliant today.',
    ],
  },
  {
    number: 11,
    name: 'Labha',
    theme: 'gains, friends, networks and what you are hoping for',
    focus: 'Gains and friends',
    titles: [
      'What you have been hoping for moves',
      'A friend is the doorway today',
      'Gains arrive through people, not effort',
      'Say the hope out loud to someone',
    ],
    advice: [
      'What arrives today arrives through people. Tell one friend what you are looking for and let them carry it.',
      'An old contact turns out to be the useful one. Message the person you last spoke to months ago.',
      'Money coming in is better placed than money going out. Collect before you commit.',
      'Name the hope out loud to someone who can act on it. This house works on being asked.',
    ],
  },
  {
    number: 12,
    name: 'Vyaya',
    theme: 'expense, rest, foreign places and letting go',
    focus: 'Rest, expense and letting go',
    titles: [
      'Rest counts as progress in this window',
      'Spend carefully, sleep properly',
      'Let the small thing go',
      'Quiet work today is seen later',
    ],
    advice: [
      'Rest is the work in these hours. A short sleep or a quiet walk will do more than one more push.',
      'Expense runs ahead of plan here. Delay anything you could equally buy on another day.',
      'Something small is asking to be released — a grudge, a group, a habit. Let it go quietly rather than announcing it.',
      'Anything foreign or behind the scenes is well placed. Work nobody sees today gets seen later.',
    ],
  },
];

/** What the window itself is good for, before the chart is consulted. */
const PHASE_LINES: Record<Phase, readonly string[]> = {
  lateNight: [
    'These are quiet hours: nothing in them needs answering tonight, so read this and let it settle until morning.',
    'The house is asleep and so is most of the world. Whatever this points at, note it now and move on it after sunrise.',
    'A small window with nobody in it. Use it for the thought you cannot have with people around.',
    'If you are awake at this hour, use it to write things down rather than to decide them.',
  ],
  dawn: [
    'The first hours are yours before anyone spends them for you. Start with this and not with your inbox.',
    'Morning gives this its best run. What you begin before the day fills up is what will actually finish.',
    'Open the day with the harder of the two tasks in front of you; the easier one survives being pushed.',
    'Do the thing you are dreading first this morning. It costs half as much before nine.',
  ],
  midday: [
    'The middle of the morning is when people answer. Use it for anything that needs someone else to move.',
    'You are past the slow start and not yet in the afternoon. Push the conversation that needs pushing.',
    'This is the working half of the day. Keep the momentum on one thing rather than spreading it over four.',
    'Late morning suits decisions. Make the one you keep rewriting and let the rest go.',
  ],
  afternoon: [
    'The afternoon is patient. What needed a second look this morning can have it now.',
    'Energy dips and attention narrows in these hours, which makes them good for the careful task, not the bold one.',
    'Use the afternoon to close things: replies, payments, the message you left half written.',
    'Anything that needs a calm voice is better done now than at six.',
  ],
  evening: [
    'The evening is for people rather than tasks. Keep the last hours for the person you have not spoken to properly.',
    'Close the day honestly: what did not get done today is tomorrow’s, not tonight’s.',
    'Evening suits reflection and family. Leave the decision-making for the morning.',
    'One conversation tonight is worth three messages. Choose the conversation.',
  ],
};

/**
 * What the fortnight is doing — waxing moons favour starting, waning ones
 * favour finishing. Classical, and it changes every fortnight, so the caution
 * never reads the same way for long.
 */
const CAUTIONS: Record<'Shukla' | 'Krishna', readonly string[]> = {
  Shukla: [
    'The moon is filling, so beginnings hold. Be careful only about promising more than the week has room for.',
    'A waxing fortnight forgives a bold start and punishes an unfinished one. Begin what you can carry.',
    'Say yes today to one thing, not three. The moon is growing and so is everything you agree to.',
    'Avoid lending in a waxing fortnight to someone who has not repaid you before.',
    'Start it now rather than on a better day. In this fortnight the better day is the earlier one.',
  ],
  Krishna: [
    'The moon is emptying, so this is a fortnight for finishing rather than launching. Close one open thing before opening another.',
    'A waning fortnight suits repair, return and refusal. Do not sign anything that needs the world to expand for it to work.',
    'If something has been dragging, this is the window to end it cleanly rather than to try once more.',
    'Keep spending tight in this fortnight. What goes out now does not come back quickly.',
    'Do not read a slow day as a bad one. A waning moon simply takes the noise out of things.',
  ],
};

/** The weekday lord, and the remedy tradition attaches to that day. */
const VARA: readonly { day: string; lord: string; remedies: readonly string[] }[] = [
  {
    day: 'Sunday',
    lord: 'Sun',
    remedies: [
      'Sunday belongs to the Sun: offer water to the rising sun and keep your word to one senior today.',
      'It is the Sun’s day — a copper vessel of water at sunrise, and no argument with your father or a superior.',
    ],
  },
  {
    day: 'Monday',
    lord: 'Moon',
    remedies: [
      'Monday belongs to the Moon: white flowers or rice at a Shiva shrine, and an early night if you can manage one.',
      'It is the Moon’s day — something white on the plate, and a kind word to your mother.',
    ],
  },
  {
    day: 'Tuesday',
    lord: 'Mars',
    remedies: [
      'Tuesday belongs to Mars: read the Hanuman Chalisa once, and keep your temper on a short leash after dark.',
      'It is Mars’ day — offer red flowers, avoid a fight you could win, and do not start a journey angry.',
    ],
  },
  {
    day: 'Wednesday',
    lord: 'Mercury',
    remedies: [
      'Wednesday belongs to Mercury: give something green away, and reread anything you are about to send.',
      'It is Mercury’s day — good for study and paperwork, so finish the form rather than carrying it another week.',
    ],
  },
  {
    day: 'Thursday',
    lord: 'Jupiter',
    remedies: [
      'Thursday belongs to Jupiter: something yellow, a little turmeric, and one honest piece of help given to a student or an elder.',
      'It is Jupiter’s day — the best day of the week to ask a teacher for time.',
    ],
  },
  {
    day: 'Friday',
    lord: 'Venus',
    remedies: [
      'Friday belongs to Venus: white sweets, clean clothes, and time given to the person you keep meaning to see.',
      'It is Venus’ day — good for anything to do with beauty, art and agreements between people who like each other.',
    ],
  },
  {
    day: 'Saturday',
    lord: 'Saturn',
    remedies: [
      'Saturday belongs to Saturn: feed a crow or a stray, give black sesame or a pair of shoes away, and do the dull duty properly.',
      'It is Saturn’s day — light a mustard-oil lamp in the evening and finish what you have been postponing.',
    ],
  },
];

export type PredictionFacts = {
  /** The instant the reading is for, local time. */
  at: Date;
  slotHour: number;
  phase: Phase;
  phaseLabel: string;
  /** Their chart. */
  kundli: Kundli;
  /** Where the moon is now. */
  moonRashi: Rashi;
  moonNakshatra: Nakshatra;
  tithi: Tithi;
  /** 1-12, counted from their natal moon sign — the heart of the reading. */
  house: number;
  houseName: string;
  houseTheme: string;
  focus: string;
  vara: string;
  varaLord: string;
  /** The best couple of hours inside this five-hour window. */
  window: string;
  /** Unique to this person and this window. */
  seed: string;
  /**
   * The same for every window in one day. The banks are drawn from this and
   * stepped by the window, which is what keeps four readings from landing on
   * the same line by chance.
   */
  daySeed: string;
  /** Their first name, or an empty string. */
  firstName: string;
};

/**
 * Everything about them that does not change, folded into one seed.
 *
 * It doubles as the signature the stored readings are kept under: change a
 * birth time and the old readings were written for somebody else.
 */
export function profileSignature(profile: OnboardingProfile): string {
  const birth = profile.birthDate
    ? `${profile.birthDate.year}-${profile.birthDate.month}-${profile.birthDate.day}`
    : 'no-date';
  const time = profile.birthTime
    ? `${profile.birthTime.hour}:${profile.birthTime.minute}${profile.birthTime.period}`
    : 'no-time';

  return [
    profile.name.trim().toLowerCase(),
    profile.gender ?? 'unsaid',
    birth,
    profile.birthTimeUnknown ? 'time-unknown' : time,
    profile.birthPlace.trim().toLowerCase() || 'no-place',
  ].join('|');
}

function clockLabel(hours: number, minutes: number): string {
  const period = hours >= 12 ? 'PM' : 'AM';
  return `${hours % 12 || 12}:${`${minutes}`.padStart(2, '0')} ${period}`;
}

/** "4:10 PM – 6:00 PM": the couple of hours inside the window that are best. */
function favourableWindow(at: Date, seed: string): string {
  const startOffset = seededRange(`${seed}:window-start`, 0, 8) * 15;
  const length = seededRange(`${seed}:window-length`, 4, 8) * 15;

  const start = new Date(at.getTime() + startOffset * 60000);
  const end = new Date(start.getTime() + length * 60000);

  return `${clockLabel(start.getHours(), start.getMinutes())} – ${clockLabel(end.getHours(), end.getMinutes())}`;
}

/**
 * The chart facts behind one window's reading, or `null` when we do not have a
 * birth date yet and therefore have nothing honest to say.
 */
export function factsFor(profile: OnboardingProfile, at: Date): PredictionFacts | null {
  const kundli = kundliFor(profile);
  if (!kundli) return null;

  const { moon } = siderealLongitudes(at);
  const moonRashi = rashiAt(moon);
  // Counted inclusively from their natal moon sign, the way a Vedic transit is
  // always read: the moon in their own rashi is the first house, not the zeroth.
  const house = ((moonRashi.index - kundli.rashi.index + 12) % 12) + 1;
  const bhava = HOUSES[house - 1];
  const vara = VARA[at.getDay()];
  const phase = PHASES[at.getHours()] ?? { key: 'midday' as Phase, label: 'Today' };
  const daySeed = `${profileSignature(profile)}#${dayKey(at)}`;
  const seed = `${profileSignature(profile)}#${predictionId(at)}`;

  return {
    at,
    slotHour: at.getHours(),
    phase: phase.key,
    phaseLabel: phase.label,
    kundli,
    moonRashi,
    moonNakshatra: nakshatraAt(moon),
    tithi: tithiFor(at),
    house,
    houseName: bhava.name,
    houseTheme: bhava.theme,
    focus: bhava.focus,
    vara: vara.day,
    varaLord: vara.lord,
    window: favourableWindow(at, seed),
    seed,
    daySeed,
    firstName: profile.name.trim().split(/\s+/)[0] ?? '',
  };
}

/* ------------------------------------------------------------------ *
 * The reading itself
 * ------------------------------------------------------------------ */

/** The written part — the only part the AI is asked to replace. */
export type PredictionText = {
  /** Notification title. One line. */
  title: string;
  /** Notification body. One sentence. */
  preview: string;
  /** The whole reading, paragraphs separated by a blank line. */
  body: string;
  /** The day's remedy, one line. */
  remedy: string;
};

export type Prediction = PredictionText & {
  id: string;
  /** Epoch milliseconds of the window this belongs to. */
  at: number;
  slotHour: number;
  phaseLabel: string;
  focus: string;
  window: string;
  /** What the reading was written from, printed under it. */
  chart: {
    rashi: string;
    nakshatra: string;
    house: number;
    houseName: string;
    houseTheme: string;
    tithi: string;
    lord: string;
  };
  source: 'ai' | 'device';
  createdAt: number;
  /** Set the first time the full reading is opened. */
  readAt?: number;
};

/** 1 -> "1st". The house number always reads as an ordinal in a chart. */
export function ordinal(value: number): string {
  const suffix =
    value % 10 === 1 && value !== 11
      ? 'st'
      : value % 10 === 2 && value !== 12
        ? 'nd'
        : value % 10 === 3 && value !== 13
          ? 'rd'
          : 'th';
  return `${value}${suffix}`;
}

/** The first sentence of a paragraph, kept short enough for a lock screen. */
function firstSentence(text: string, limit = 120): string {
  const end = text.search(/[.!?]\s/);
  const sentence = end === -1 ? text : text.slice(0, end + 1);
  if (sentence.length <= limit) return sentence;
  return `${sentence.slice(0, limit - 1).trimEnd()}…`;
}

/**
 * Seeded pick, walked on by `step`.
 *
 * `seededRange` returns the same index `seededPick` would choose, so this is
 * that pick with a stride: same seed, same starting line, and a predictable
 * walk through the bank from there.
 */
function pickAt<T>(seed: string, items: readonly T[], step: number): T {
  const index = seededRange(seed, 0, items.length - 1);
  return items[(index + step) % items.length];
}

/**
 * The reading, written on the device.
 *
 * This is what a person gets when no AI key is configured, and what they get
 * anyway if the call fails — the notification should never go out empty. The
 * seed is theirs, so the pick is theirs: same chart, same window, same words,
 * and a different set for the person sitting next to them.
 */
export function composePrediction(facts: PredictionFacts): PredictionText {
  const bhava = HOUSES[facts.house - 1];
  const vara = VARA[facts.at.getDay()];

  // The moon usually stays in one house all day, so four readings would draw
  // from the same short bank four times. Stepping each pick by the window's
  // place in the cycle spreads them out: the seed still decides where in the
  // bank the person starts, and the step guarantees they never hear the same
  // line twice in a day.
  const step = Math.max(0, SLOT_HOURS.indexOf(facts.slotHour as (typeof SLOT_HOURS)[number]));

  const title = pickAt(`${facts.daySeed}:title`, bhava.titles, step);
  const advice = pickAt(`${facts.daySeed}:advice`, bhava.advice, step);
  const timing = seededPick(`${facts.seed}:phase`, PHASE_LINES[facts.phase]);
  const caution = pickAt(`${facts.daySeed}:caution`, CAUTIONS[facts.tithi.paksha], step);
  const remedy = pickAt(`${facts.daySeed}:remedy`, vara.remedies, step);

  const opening = facts.firstName
    ? `${facts.firstName}, the moon is in ${facts.moonNakshatra.name} today and crossing your ${ordinal(facts.house)} house from ${facts.kundli.rashi.vedic} — the house of ${facts.houseTheme}.`
    : `The moon is in ${facts.moonNakshatra.name} today and crossing your ${ordinal(facts.house)} house from ${facts.kundli.rashi.vedic} — the house of ${facts.houseTheme}.`;

  const body = [
    `${opening} ${timing}`,
    advice,
    `${caution} Your best hours in this window are ${facts.window}.`,
  ].join('\n\n');

  return { title, preview: firstSentence(advice), body, remedy };
}

/** Facts plus words: the object the notification and the screen both read. */
export function buildPrediction(
  facts: PredictionFacts,
  text: PredictionText,
  source: 'ai' | 'device',
): Prediction {
  return {
    ...text,
    id: predictionId(facts.at),
    at: facts.at.getTime(),
    slotHour: facts.slotHour,
    phaseLabel: facts.phaseLabel,
    focus: facts.focus,
    window: facts.window,
    chart: {
      rashi: `${facts.kundli.rashi.vedic} · ${facts.kundli.rashi.western}`,
      nakshatra: facts.moonNakshatra.name,
      house: facts.house,
      houseName: facts.houseName,
      houseTheme: facts.houseTheme,
      tithi: `${facts.tithi.paksha} ${facts.tithi.name}`,
      lord: facts.kundli.rashi.lord,
    },
    source,
    createdAt: Date.now(),
  };
}

/** "Sat 20 Sep, 9:00 PM" — the line above a reading. */
export function formatSlot(at: Date): string {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];
  return `${days[at.getDay()]} ${at.getDate()} ${months[at.getMonth()]}, ${clockLabel(at.getHours(), at.getMinutes())}`;
}

/** "9:00 PM" on its own. */
export function formatSlotTime(at: Date): string {
  return clockLabel(at.getHours(), at.getMinutes());
}

/** "in 2h 10m" / "in 12m" — how long until the next reading arrives. */
export function formatCountdown(from: Date, to: Date): string {
  const minutes = Math.max(0, Math.round((to.getTime() - from.getTime()) / 60000));
  if (minutes < 1) return 'any moment now';
  if (minutes < 60) return `in ${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest ? `in ${hours}h ${rest}m` : `in ${hours}h`;
}
