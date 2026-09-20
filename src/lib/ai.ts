/**
 * The AI astrologer.
 *
 * The device can already write a reading on its own (`composePrediction`), and
 * that is the floor: a notification must never go out empty. This module is
 * the ceiling — it hands Claude the same computed chart facts and asks for the
 * words, so the four readings a person gets in a day are written for their
 * chart, in their language, and do not repeat each other.
 *
 * The key is supplied by whoever runs the app, either as
 * `EXPO_PUBLIC_ANTHROPIC_API_KEY` at build time or typed into Prediction
 * alerts. Both live on the device, and anything on a device can be read off
 * it: for a published app, point `EXPO_PUBLIC_ASTRO_AI_URL` at your own
 * endpoint that holds the real key and forwards to the Messages API.
 */
import Anthropic from '@anthropic-ai/sdk';

import { ordinal, predictionId, type PredictionFacts, type PredictionText } from './predictions';

/**
 * Opus 5. The readings are short, so the bill is a few hundred output tokens
 * per person per day, and the quality of a four-sentence reading is the whole
 * product here.
 */
export const AI_MODEL = 'claude-opus-5';

/** A key baked in at build time, if there is one. */
export const BUILD_TIME_KEY = process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY ?? '';

/** Your own proxy, if you have one. Empty means call the API directly. */
const PROXY_URL = process.env.EXPO_PUBLIC_ASTRO_AI_URL ?? '';

/** True when the app has somewhere to send the request. */
export function canUseAi(key: string): boolean {
  return key.trim().length > 0 || PROXY_URL.length > 0;
}

/** An Anthropic key looks like this; worth saying before a request is spent. */
export function looksLikeKey(key: string): boolean {
  return /^sk-ant-/.test(key.trim());
}

export class AiError extends Error {}

const SYSTEM = `You are the astrologer behind AstroNepali, a Nepali Vedic astrology app. You write the short reading a person receives on their phone every five hours.

You are given that person's birth chart and the transit facts for each window, already computed. Write from those facts only — never invent a planet, a dasha or a placement that is not in the brief, and never claim to know an event that has happened.

How to write:
- Address the person directly as "you". Use their first name at most once per reading.
- Every window must read differently: a different opening, a different subject, and advice that suits the hour named in the brief.
- Be concrete and practical — one clear thing to do in these five hours, tied to the house the moon is transiting.
- Be warm and plain. No emoji, no exclamation marks, no capitalised drama, no astrological jargon you do not explain in the same sentence.
- Encourage, but never guarantee an outcome, and never give medical, legal or financial instructions. No predictions about death, illness, pregnancy or disaster.
- Write in the language named in the brief.

Each reading has four parts:
- title: the one line that appears on the lock screen. At most 52 characters, no full stop.
- preview: one sentence under it, at most 110 characters, saying what to do.
- body: 60 to 110 words, two or three short paragraphs separated by a blank line. Name the house and what it governs once, then spend the rest on the person.
- remedy: one sentence, a simple traditional remedy fitting the weekday lord in the brief.`;

const SCHEMA = {
  type: 'object',
  properties: {
    readings: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string', description: 'The id of the window this reading is for' },
          title: { type: 'string' },
          preview: { type: 'string' },
          body: { type: 'string' },
          remedy: { type: 'string' },
        },
        required: ['id', 'title', 'preview', 'body', 'remedy'],
        additionalProperties: false,
      },
    },
  },
  required: ['readings'],
  additionalProperties: false,
} as const;

/** The person, as much of them as the reading is allowed to lean on. */
export type AiPerson = {
  firstName: string;
  gender: string;
  birthDetails: string;
  birthPlace: string;
  /** The language the reading should be written in. */
  language: string;
};

function brief(person: AiPerson, facts: PredictionFacts[]): string {
  const [first] = facts;
  const chart = first.kundli;

  const windows = facts
    .map((slot) =>
      [
        `- id: ${predictionId(slot.at)}`,
        `  local time: ${slot.phaseLabel} on ${slot.vara}, from ${slot.slotHour}:00, covering the next five hours`,
        `  moon today: ${slot.moonNakshatra.name} nakshatra, ${slot.moonRashi.vedic} rashi`,
        `  transiting their ${ordinal(slot.house)} house (${slot.houseName}) — ${slot.houseTheme}`,
        `  tithi: ${slot.tithi.paksha} ${slot.tithi.name}`,
        `  weekday lord: ${slot.varaLord} (${slot.vara})`,
        `  favourable hours inside the window: ${slot.window}`,
      ].join('\n'),
    )
    .join('\n');

  return `The person
- first name: ${person.firstName || 'not given'}
- gender: ${person.gender}
- born: ${person.birthDetails} in ${person.birthPlace}
- write in: ${person.language}

Their chart
- moon sign (rashi): ${chart.rashi.vedic} / ${chart.rashi.western}, lord ${chart.rashi.lord}
- birth nakshatra: ${chart.nakshatra.name}, pada ${chart.nakshatra.pada}
- sidereal sun sign: ${chart.sunRashi.vedic}
- lagna: ${chart.lagna ? `${chart.lagna.vedic} (estimated)` : 'unknown — they did not give an exact birth time, so do not mention the rising sign'}
- tithi at birth: ${chart.tithi.paksha} ${chart.tithi.name}, born on a ${chart.vara}

The windows to write, one reading each, in this order
${windows}

Return one reading per id above, using exactly those ids.`;
}

function textOf(response: Anthropic.Message): string {
  return response.content
    .filter((block): block is Anthropic.TextBlock => block.type === 'text')
    .map((block) => block.text)
    .join('');
}

function cleanLine(value: unknown, limit: number): string {
  if (typeof value !== 'string') return '';
  const line = value.replace(/\s+/g, ' ').trim();
  return line.length > limit ? `${line.slice(0, limit - 1).trimEnd()}…` : line;
}

/**
 * One request for the whole day's windows.
 *
 * Asking for all of them together is what stops the readings repeating: the
 * model can see what it already said at eleven when it writes the four o'clock
 * one. Anything missing or malformed simply does not appear in the returned
 * map, and the caller falls back to the device for that window.
 */
export async function writeReadings(
  apiKey: string,
  person: AiPerson,
  facts: PredictionFacts[],
): Promise<Map<string, PredictionText>> {
  if (!facts.length) return new Map();
  if (!canUseAi(apiKey)) throw new AiError('No AI key is configured.');

  const client = new Anthropic({
    // A proxy carries the real key; without one the key here is the real key.
    apiKey: apiKey.trim() || 'via-proxy',
    ...(PROXY_URL ? { baseURL: PROXY_URL } : {}),
    // The app runs on the web too, where the SDK refuses to send a key unless
    // it is told the risk is understood. It is: see the note at the top.
    dangerouslyAllowBrowser: true,
    // A phone should not sit on a request for ten minutes.
    timeout: 60_000,
    maxRetries: 1,
  });

  let response: Anthropic.Message;
  try {
    response = await client.messages.create({
      model: AI_MODEL,
      // Four readings of about a hundred words each, so the ceiling is low on
      // purpose: it is a bounded output, not a conversation.
      max_tokens: 4096,
      system: SYSTEM,
      output_config: {
        // Short, formulaic writing — the model does not need to deliberate.
        effort: 'low',
        format: { type: 'json_schema', schema: SCHEMA as unknown as Record<string, unknown> },
      },
      messages: [{ role: 'user', content: brief(person, facts) }],
    });
  } catch (error) {
    if (error instanceof Anthropic.AuthenticationError) {
      throw new AiError('That API key was refused. Check it and try again.');
    }
    if (error instanceof Anthropic.RateLimitError) {
      throw new AiError('The AI is rate limited right now. Your readings were written on the device instead.');
    }
    if (error instanceof Anthropic.APIError) {
      throw new AiError(`The AI could not be reached (${error.status ?? 'network'}).`);
    }
    throw new AiError('The AI could not be reached.');
  }

  if (response.stop_reason === 'refusal') {
    throw new AiError('The AI declined to write this one.');
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(textOf(response));
  } catch {
    throw new AiError('The AI sent something we could not read.');
  }

  const readings = (parsed as { readings?: unknown }).readings;
  if (!Array.isArray(readings)) throw new AiError('The AI sent something we could not read.');

  const written = new Map<string, PredictionText>();
  for (const entry of readings) {
    if (!entry || typeof entry !== 'object') continue;
    const row = entry as Record<string, unknown>;
    const id = typeof row.id === 'string' ? row.id : '';

    const title = cleanLine(row.title, 52);
    const preview = cleanLine(row.preview, 110);
    const remedy = cleanLine(row.remedy, 180);
    const body = typeof row.body === 'string' ? row.body.trim() : '';

    // A half-written reading is worse than the device's own, so skip it.
    if (!id || !title || !preview || !body) continue;
    written.set(id, { title, preview, body, remedy });
  }

  return written;
}
