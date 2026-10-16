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
