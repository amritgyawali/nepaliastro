import { liveConfig } from './live';
import type { Currency } from './schema';

const FALLBACK: Currency = { code: 'USD', symbol: '$', style: 'code', decimals: 2, perMinute: '/min' };

/**
 * A price in the currency the dashboard set: "USD 0.49/min", "रू 45".
 * Every price on the app's screens goes through here.
 */
export function formatMoney(
  amount: number,
  currency: Currency = liveConfig()?.branding.currency ?? FALLBACK,
  options: { perMinute?: boolean; decimals?: number } = {},
): string {
  const decimals = options.decimals ?? currency.decimals;
  const number = amount.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
  const money = currency.style === 'symbol' ? `${currency.symbol}${number}` : `${currency.code} ${number}`;
  return options.perMinute ? `${money}${currency.perMinute}` : money;
}

/** A whole-number price, as the remedy cards print them. */
export function formatPrice(amount: number): string {
  return formatMoney(amount, undefined, { decimals: Number.isInteger(amount) ? 0 : undefined });
}
