/**
 * Deterministic picks.
 *
 * The scheduled readings have to be stable: the same person, in the same
 * five-hour window, must get the same words however many times the screen is
 * opened or the app is reinstalled. Randomness would break that, so choices
 * are made by hashing a seed built from the person's own birth details and
 * the moment being read — which also means two people never receive the same
 * sentence in the same window.
 */

/** YYYY-MM-DD, used as the seed for anything that should hold for a day. */
export function dayKey(date = new Date()): string {
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

/** FNV-1a: a short, stable string hash. */
function hash(input: string): number {
  let value = 0x811c9dc5;
  for (let i = 0; i < input.length; i += 1) {
    value ^= input.charCodeAt(i);
    value = Math.imul(value, 0x01000193);
  }
  return value >>> 0;
}

/** A value in [min, max] that depends only on the seed. */
export function seededRange(seed: string, min: number, max: number): number {
  const span = max - min + 1;
  return min + (hash(seed) % span);
}

export function seededPick<T>(seed: string, items: readonly T[]): T {
  return items[hash(seed) % items.length];
}
