import type { Money } from './money.js';
import { currencies, type CurrencyCode } from './reference.js';

export type ParseMoneyResult =
  { success: true; amountMinor: number } | { success: false; error: string };

/** Whole digits, optionally grouped by commas in threes, then an optional `.` and fraction digits. */
const EN_AMOUNT = /^(\d{1,3}(?:,\d{3})+|\d+)(?:\.(\d+))?$/;

/**
 * Reads typed money in the app's `en` format as whole minor units (ADR 0003, *Text and integers*).
 * String operations only, never float arithmetic.
 */
export function parseMoney(input: string, currency: CurrencyCode): ParseMoneyResult {
  const match = EN_AMOUNT.exec(input.trim());
  if (!match) {
    return { success: false, error: 'Use digits, comma thousands separators and a decimal point' };
  }
  const [, whole = '', fraction] = match;
  const { exponent } = currencies[currency];
  if (fraction !== undefined && exponent === 0) {
    return { success: false, error: `${currency} has no decimals` };
  }
  if (fraction !== undefined && fraction.length > exponent) {
    return { success: false, error: `${currency} takes at most ${exponent} decimals` };
  }
  const amountMinor = Number(whole.replaceAll(',', '') + (fraction ?? '').padEnd(exponent, '0'));
  if (!Number.isSafeInteger(amountMinor)) {
    return { success: false, error: 'Amount is too large' };
  }
  return { success: true, amountMinor };
}

/** The app's one locale (ADR 0004, *Copy and locale*). */
export type AppLocale = 'en';

/** `amountMinor` as an exact decimal string of major units, e.g. 125000050 with 2 decimals is "1250000.50". */
function toDecimalString(amountMinor: number, exponent: number): `${number}` {
  const digits = String(amountMinor).padStart(exponent + 1, '0');
  if (exponent === 0) {
    return digits as `${number}`;
  }
  const point = digits.length - exponent;
  return `${digits.slice(0, point)}.${digits.slice(point)}` as `${number}`;
}

/**
 * Shows money as text with its own currency's symbol (ADR 0003, *Text and integers*). The decimal
 * string is built from the integer with string operations, and `Intl.NumberFormat` only groups it
 * and adds the symbol, always in the explicit locale, never the machine's default.
 */
export function formatMoney(money: Money, locale: AppLocale): string {
  if (!Number.isSafeInteger(money.amountMinor) || money.amountMinor < 0) {
    throw new RangeError(
      `formatMoney needs a non-negative safe integer, got ${money.amountMinor}.`,
    );
  }
  const { exponent } = currencies[money.currency];
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: money.currency,
    minimumFractionDigits: exponent,
    maximumFractionDigits: exponent,
  }).format(toDecimalString(money.amountMinor, exponent));
}
