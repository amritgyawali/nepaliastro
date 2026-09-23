/**
 * The AI astrologer that writes the five-hourly readings.
 *
 * The device can already write a reading on its own (`composePrediction`), and
 * that is the floor: a notification must never go out empty. This module is
 * the ceiling — it hands Groq the same computed chart facts and asks for the
 * words, so the four readings a person gets in a day are written for their
 * chart, in their language, and do not repeat each other.
 *
 * Groq's free tier is what makes that affordable: one request writes the whole
 * day. The transport, the key and the model all live in `groq.ts`, and the
 * chart the model is handed is built in `chart-brief.ts`, which the AI
 * Astrologer Baba chat shares.
 */
import { liveAi } from '@/config/live';

import { kundliBrief, whoBrief, type AiPerson } from './chart-brief';
import { AiError, groqChat, parseJsonReply } from './groq';
import { ordinal, predictionId, type PredictionFacts, type PredictionText } from './predictions';

export { AI_MODEL, AiError, BUILD_TIME_KEY, canUseAi, looksLikeKey } from './groq';
export type { AiPerson } from './chart-brief';

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
- remedy: one sentence, a simple traditional remedy fitting the weekday lord in the brief.

Reply with a single JSON object and nothing else, in exactly this shape:
{"readings":[{"id":"<the id of the window>","title":"…","preview":"…","body":"…","remedy":"…"}]}
Use the window ids from the brief exactly as they are written, one entry each, in the same order.`;

function brief(person: AiPerson, facts: PredictionFacts[]): string {
  const [first] = facts;

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

  // The chart section is the same one Baba answers from: the engine can say
  // more than the old chart could, and a reading written without the running
  // dasha is a reading written without the clock.
  return `${whoBrief(person)}

${kundliBrief(first.kundli)}

The windows to write, one reading each, in this order
${windows}

Return one reading per id above, using exactly those ids.`;
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

  const tuning = liveAi();
  const notes = tuning?.readingNotes?.trim();
  const reply = await groqChat(
    apiKey,
    [
      { role: 'system', content: notes ? `${SYSTEM}\n\nAlso, from the people who run the app:\n${notes}` : SYSTEM },
      { role: 'user', content: brief(person, facts) },
    ],
    {
      // Four readings of about a hundred words each, so the ceiling is low on
      // purpose: it is a bounded output, not a conversation.
      maxTokens: 4096,
      // Short, formulaic writing that still has to differ window to window.
      temperature: tuning?.readingTemperature ?? 0.8,
      json: true,
    },
  );

  const readings = (parseJsonReply(reply) as { readings?: unknown }).readings;
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
