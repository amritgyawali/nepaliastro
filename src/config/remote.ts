/**
 * Moving a config between devices through a server.
 *
 * The app does not come with a server. What it can do is read a config from
 * any URL that returns one as JSON, and send one to any URL that accepts one.
 * That is enough to run it off a static file on a CDN (read only), a JSON
 * store such as jsonbin.io, or an endpoint of your own:
 *
 * - `GET  <url>` returns the published config as JSON (the object itself, or
 *   `{ "record": <config> }` as jsonbin wraps it).
 * - `PUT  <url>` (or POST) with the config as the JSON body stores it. The
 *   token, if one is set, goes in the header you name — `Authorization:
 *   Bearer <token>` unless you say otherwise.
 *
 * Every device built with `EXPO_PUBLIC_CONFIG_URL` set reads that URL when it
 * starts, and takes the config if its revision is newer than its own.
 */
import { configProblem, normalizeConfig } from './merge';
import type { AppConfig } from './schema';

export const DEVICE_CONFIG_URL = process.env.EXPO_PUBLIC_CONFIG_URL ?? '';

export type RemoteTarget = {
  url: string;
  /** Sent with the token. `Authorization` sends `Bearer <token>`. */
  headerName: string;
  token: string;
  method: 'PUT' | 'POST';
};

function headersFor(target: Pick<RemoteTarget, 'headerName' | 'token'>): Record<string, string> {
  const headers: Record<string, string> = { Accept: 'application/json' };
  const token = target.token.trim();
  if (!token) return headers;
  const name = target.headerName.trim() || 'Authorization';
  headers[name] = name.toLowerCase() === 'authorization' && !/^bearer\s/i.test(token) ? `Bearer ${token}` : token;
  return headers;
}

async function withTimeout<T>(run: (signal: AbortSignal) => Promise<T>, ms = 15_000): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    return await run(controller.signal);
  } finally {
    clearTimeout(timer);
  }
}

/** Reads and checks a config from `url`. Throws with a readable message. */
export async function pullConfig(
  target: Pick<RemoteTarget, 'url' | 'headerName' | 'token'>,
): Promise<AppConfig> {
  if (!/^https?:\/\//i.test(target.url.trim())) throw new Error('Enter a URL starting with https://');
  const response = await withTimeout((signal) =>
    fetch(target.url.trim(), { headers: headersFor(target), signal }),
  ).catch(() => {
    throw new Error('The server could not be reached.');
  });
  if (!response.ok) throw new Error(`The server answered ${response.status}.`);
  let body: unknown;
  try {
    body = await response.json();
  } catch {
    throw new Error('The server did not send JSON.');
  }
  const record =
    body && typeof body === 'object' && 'record' in (body as object)
      ? (body as { record: unknown }).record
      : body;
  const problem = configProblem(record);
  if (problem) throw new Error(problem);
  return normalizeConfig(record);
}

/** Sends `config` to the target. Throws with a readable message. */
export async function pushConfig(target: RemoteTarget, config: AppConfig): Promise<void> {
  if (!/^https?:\/\//i.test(target.url.trim())) throw new Error('Enter a URL starting with https://');
  const response = await withTimeout((signal) =>
    fetch(target.url.trim(), {
      method: target.method,
      headers: { ...headersFor(target), 'Content-Type': 'application/json' },
      body: JSON.stringify(config),
      signal,
    }),
  ).catch(() => {
    throw new Error('The server could not be reached.');
  });
  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      throw new Error('The server refused the token.');
    }
    throw new Error(`The server answered ${response.status}.`);
  }
}
