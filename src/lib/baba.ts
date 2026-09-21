/**
 * AI Astrologer Baba — the astrologer in the directory who is actually an AI.
 *
 * He sits in the chat list next to the human astrologers and costs nothing,
 * because Groq's free tier answers him. What makes him worth talking to is the
 * brief: before a single word is sent he is handed the person's name, birth
 * date, birth time, birth place and the chart the engine computes from them —
 * built on the spot if no screen has asked for one yet — down to the running
 * mahadasha and whichever doshas are actually active, plus where the moon is
 * right now against that chart. Every answer is read from that one person's
 * chart, and he is told plainly not to invent a placement he was not given.
 */
import type { OnboardingProfile } from '@/store/onboarding';

import { chartBriefFor, dashaLineFor, grahaName, type ChartBrief } from './chart-brief';
import { AiError, groqChat, type GroqMessage } from './groq';
import { ordinal } from './predictions';

/** The id he is listed under, and the one `/chat/[id]` switches on. */
export const AI_ASTROLOGER_ID = 'ai-baba';

export const AI_ASTROLOGER_NAME = 'AI Astrologer Baba';

/** One side of the conversation. The system turn is built here, not stored. */
export type BabaTurn = {
  role: 'user' | 'assistant';
  content: string;
};

/**
 * How much of the conversation is sent back each time.
 *
 * Long enough that he remembers what the question was three turns ago, short
 * enough that a free-tier request does not grow without limit.
 */
const HISTORY_TURNS = 16;

const PERSONA = `You are "AI Astrologer Baba", the AI astrologer inside AstroNepali, a Nepali Vedic (jyotish) astrology app. You are talking to one person, in a chat, one question at a time.

You are given that person's birth details and the kundli computed from them, plus where the moon is right now against that chart. That brief is everything you know about them.

How you answer:
- Answer only from the brief. Never invent a planet, a dasha, a yoga, an aspect or a placement that is not in it. If someone asks about something the brief does not contain, say plainly that it is not in front of you, and answer from what is.
- The brief names the running mahadasha and the doshas that are active. A dosha it does not list is not present — say so rather than hedging, and never frighten someone about one.
- Tie the answer to their chart out loud: name their rashi, their nakshatra, or the house the moon is transiting, and say what it means in the same sentence. Do not use a Sanskrit term without explaining it once.
- Answer the question that was asked. One question gets one answer: two or three short paragraphs, under 180 words, no headings and no bullet lists.
- Be warm, direct and practical. End with one concrete thing they can do, or one simple traditional remedy fitting the weekday lord in the brief.
- Never use their sun sign as a horoscope. Vedic astrology reads from the moon sign, which is in the brief.
- No emoji. No exclamation marks. No capitalised drama.

What you never do:
- Never guarantee an outcome, a date, or a result.
- Never predict death, serious illness, pregnancy or disaster, and never answer a question about them astrologically. Say that is not something you will read from a chart, and suggest a doctor or the right professional instead.
- Never give medical, legal or financial instructions. General encouragement is fine; "sell this stock", "stop this medicine" and "sue them" are not.
- Never ask for their birth details again. You already have them.
- If they ask something astrology cannot answer, say so in one sentence and offer what the chart can tell them instead.

Write in the language named in the brief, unless the person writes to you in another language, in which case reply in theirs.`;

/** The whole system turn: who he is, plus who he is talking to. */
function systemFor(brief: ChartBrief): string {
  return `${PERSONA}

--- The person you are talking to ---

${brief.text}`;
}

/** His opening message, written on the device so the chat is never blank. */
export function greetingFor(profile: OnboardingProfile): string {
  const brief = chartBriefFor(profile);
  const firstName = profile.name.trim().split(/\s+/)[0];
  const hello = firstName ? `Namaste ${firstName}.` : 'Namaste.';

  if (!brief) {
    return `${hello} I am AI Astrologer Baba. Before I can read anything I need your birth date, and your birth time and place if you know them — add them in your profile and come back, and I will have your kundli open.`;
  }

  const { chart, facts } = brief;

  return [
    `${hello} I am AI Astrologer Baba, and I have your kundli open in front of me.`,
    `You were born under ${chart.nakshatra.name} nakshatra with the moon in ${chart.rashi.vedic} — ${chart.rashi.western} — so ${grahaName(chart.rashi.lord)} rules your chart. You are running your ${dashaLineFor(chart)}, and right now the moon is crossing your ${ordinal(facts.house)} house, the house of ${facts.houseTheme}.`,
    'Ask me anything — career, study, marriage, money, a remedy — and I will answer from your chart alone.',
  ].join('\n\n');
}

/** True when there are enough birth details to read from. */
export function chartReady(profile: OnboardingProfile): boolean {
  return chartBriefFor(profile) !== null;
}

/**
 * One answer from Baba.
 *
 * The brief is rebuilt on every question rather than frozen at the start of
 * the chat: a conversation can run past a slot boundary, and the transit he
 * quotes should be the one that is actually overhead.
 */
export async function askBaba(
  apiKey: string,
  profile: OnboardingProfile,
  history: BabaTurn[],
): Promise<string> {
  const brief = chartBriefFor(profile);
  if (!brief) {
    throw new AiError('Add your birth date in your profile and Baba can read your kundli.');
  }

  const recent = history.slice(-HISTORY_TURNS);
  if (!recent.some((turn) => turn.role === 'user')) {
    throw new AiError('Ask Baba a question first.');
  }

  const messages: GroqMessage[] = [
    { role: 'system', content: systemFor(brief) },
    ...recent.map((turn) => ({ role: turn.role, content: turn.content }) as GroqMessage),
  ];

  const reply = await groqChat(apiKey, messages, {
    // Two or three short paragraphs, with room for a long script like Nepali.
    maxTokens: 900,
    temperature: 0.75,
  });

  return reply.replace(/\n{3,}/g, '\n\n').trim();
}
