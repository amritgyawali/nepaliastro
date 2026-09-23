/**
 * The published config, readable from anywhere without a React context.
 *
 * Screens that render inside the provider can use `useAppConfig()`, but the
 * AI transport, the notification writer and plain helper functions run
 * outside React. They read the same object from here. `apply.ts` sets it;
 * nothing else writes to it.
 *
 * This module imports types only, so anything may import it without a cycle.
 */
import type { AppConfig } from './schema';

let current: AppConfig | null = null;

export function setLiveConfig(config: AppConfig): void {
  current = config;
}

/** The config the app is running on, or `null` before the first apply. */
export function liveConfig(): AppConfig | null {
  return current;
}

/** Settings the Groq transport and Baba read on every request. */
export function liveAi(): AppConfig['ai'] | null {
  return current?.ai ?? null;
}
