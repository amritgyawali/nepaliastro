/**
 * The transport to Groq.
 *
 * Groq serves open models on a free tier, which is the whole reason it is
 * here: the app can write a reading and hold a conversation without anyone
 * paying per token. There is no SDK — the API is OpenAI-shaped, so one
 * `fetch` covers both of the things this app asks for.
 *
 * The key is supplied by whoever runs the app, either as
 * `EXPO_PUBLIC_GROQ_API_KEY` at build time or typed into Prediction alerts.
 * Both live on the device, and anything on a device can be read off it: for a
 * published build, point `EXPO_PUBLIC_ASTRO_AI_URL` at your own endpoint that
 * holds the real key and forwards to Groq.
 */
import { liveAi } from '@/config/live';

/** Groq's endpoint, unless a proxy takes its place. */
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';

/**
 * The model behind both the readings and the chat.
 *
 * Llama 3.3 70B is the largest thing on Groq's free tier, it follows a system
 * prompt closely enough to stay inside the chart facts it is given, and it
 * answers fast enough that a chat bubble does not feel stalled.
 */
export const AI_MODEL = 'llama-3.3-70b-versatile';

/** A key baked in at build time, if there is one. */
export const BUILD_TIME_KEY = process.env.EXPO_PUBLIC_GROQ_API_KEY ?? '';

/** Your own proxy, if you have one. Empty means call Groq directly. */
export const PROXY_URL = process.env.EXPO_PUBLIC_ASTRO_AI_URL ?? '';

/** True when the app has somewhere to send the request. */
export function canUseAi(key: string): boolean {
  return key.trim().length > 0 || PROXY_URL.length > 0;
}

/** A Groq key looks like this; worth saying before a request is spent. */
export function looksLikeKey(key: string): boolean {
  return /^gsk_/.test(key.trim());
}

export class AiError extends Error {}

export type GroqRole = 'system' | 'user' | 'assistant';

export type GroqMessage = {
  role: GroqRole;
  content: string;
};

type ChatOptions = {
  /** Ceiling on the answer. Both callers here want something bounded. */
  maxTokens: number;
  temperature?: number;
  /** Ask for a single JSON object rather than prose. */
  json?: boolean;
  /** A phone should not sit on a request for minutes. */
  timeoutMs?: number;
  /** Overrides the model the dashboard published, for its own test console. */
  model?: string;
};

/** The model the dashboard published, or the one this file names. */
export function currentModel(): string {
  return liveAi()?.model?.trim() || AI_MODEL;
}

type Completion = {
  choices?: { message?: { content?: string } }[];
  error?: { message?: string };
};

/** One turn of the OpenAI-shaped chat API, with the errors named. */
export async function groqChat(
  apiKey: string,
  messages: GroqMessage[],
  { maxTokens, temperature = 0.7, json = false, timeoutMs = 45_000, model }: ChatOptions,
): Promise<string> {
  if (!canUseAi(apiKey)) throw new AiError('No AI key is configured.');

  const controller = new AbortController();
  // The deadline covers reading the body as well as opening the connection,
  // so it is only cleared once there is something parsed to return.
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  let response: Response;
  let body: Completion;
  try {
    try {
      response = await fetch(PROXY_URL || GROQ_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // A proxy carries the real key; without one the key here is the real key.
          Authorization: `Bearer ${apiKey.trim() || 'via-proxy'}`,
        },
        body: JSON.stringify({
          model: model ?? currentModel(),
          messages,
          max_completion_tokens: maxTokens,
          temperature,
          ...(json ? { response_format: { type: 'json_object' } } : {}),
        }),
        signal: controller.signal,
      });
    } catch {
      throw new AiError('The AI could not be reached. Check your connection.');
    }

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        throw new AiError('That Groq key was refused. Check it and try again.');
      }
      if (response.status === 429) {
        throw new AiError('The free tier is rate limited right now. Try again in a minute.');
      }
      throw new AiError(`The AI could not be reached (${response.status}).`);
    }

    try {
      body = (await response.json()) as Completion;
    } catch {
      throw new AiError('The AI sent something we could not read.');
    }
  } finally {
    clearTimeout(timer);
  }

  if (body.error?.message) throw new AiError(body.error.message);

  const text = body.choices?.[0]?.message?.content?.trim() ?? '';
  if (!text) throw new AiError('The AI sent an empty answer.');

  return text;
}

/**
 * The first JSON object in a reply, parsed.
 *
 * `response_format: json_object` is meant to guarantee this, but a model on a
 * free tier occasionally wraps it in a fence or a sentence, and a reading that
 * fails to parse costs the person their notification.
 */
export function parseJsonReply(text: string): unknown {
  const trimmed = text.replace(/^```(?:json)?/i, '').replace(/```$/, '').trim();
  try {
    return JSON.parse(trimmed);
  } catch {
    const start = trimmed.indexOf('{');
    const end = trimmed.lastIndexOf('}');
    if (start === -1 || end <= start) throw new AiError('The AI sent something we could not read.');
    try {
      return JSON.parse(trimmed.slice(start, end + 1));
    } catch {
      throw new AiError('The AI sent something we could not read.');
    }
  }
}
