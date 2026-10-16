import {
  currencies,
  divideRoundHalfUpBigInt,
  exchangeRates,
  type CurrencyCode,
  type Money,
} from '@acme/contract';
import { assertSafeInteger } from './rounding';

/** Rates are scaled by 10⁶ (ADR 0001, *Exchange rate table*). */
const RATE_SCALE = 1_000_000n;
const USD_EXPONENT = BigInt(currencies.USD.exponent);

export type RatesPerUsd = Readonly<Record<CurrencyCode, number>>;

/** Money in US cents, as every conversion gives it. */
export type UsdMoney = Money & { currency: 'USD' };

/**
 * Converts a local amount to USD cents once: `localMinor · 10^(2 − exp) · 10⁶ / rate`, rounded half
 * up. The product passes 2⁵³ for large totals, so it runs in BigInt (as a share of payroll does),
 * and the result is asserted as a safe integer (ADR 0001).
 */
export function toUsd(
  money: Money,
  ratesPerUsd: RatesPerUsd = exchangeRates.ratesPerUsd,
): UsdMoney {
  assertSafeInteger(money.amountMinor, 'The amount to convert');
  if (money.amountMinor < 0) {
    throw new RangeError(`Cannot convert a negative amount: ${money.amountMinor}.`);
  }
  const rate = ratesPerUsd[money.currency];
  if (!Number.isSafeInteger(rate) || rate <= 0) {
    throw new RangeError(`${money.currency} has no usable rate: ${rate}.`);
  }
  const exponentGap = USD_EXPONENT - BigInt(currencies[money.currency].exponent);
  const numerator = BigInt(money.amountMinor) * 10n ** exponentGap * RATE_SCALE;
  const cents = Number(divideRoundHalfUpBigInt(numerator, BigInt(rate)));
  assertSafeInteger(cents, 'The converted amount');
  return { amountMinor: cents, currency: 'USD' };
}
