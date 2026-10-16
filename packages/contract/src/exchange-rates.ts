import { z } from 'zod';
import type { CurrencyCode } from './reference.js';
import { divideRoundHalfUpBigInt } from './rounding.js';

/** Rates are local currency units per 1 USD, scaled to 6 decimals (ADR 0001). */
const RATE_DECIMALS = 6;

/** A published decimal string such as "108.8205", as an integer and its count of decimals. */
function parseDecimal(text: string): { digits: bigint; decimals: number } {
  const match = /^(\d+)(?:\.(\d+))?$/.exec(text);
  if (!match) {
    throw new RangeError(`Not a decimal rate: "${text}".`);
  }
  const [, whole = '', fraction = ''] = match;
  return { digits: BigInt(whole + fraction), decimals: fraction.length };
}

/**
 * Local units per 1 USD, scaled by 10⁶, from two EUR-based rates: (EUR→local) ÷ (EUR→USD).
 * Scaled BigInt division of the decimal strings, rounded half up once, with no float division.
 */
export function deriveRatePerUsd(eurToLocal: string, eurToUsd: string): number {
  const local = parseDecimal(eurToLocal);
  const usd = parseDecimal(eurToUsd);
  const numerator = local.digits * 10n ** BigInt(RATE_DECIMALS + usd.decimals);
  const denominator = usd.digits * 10n ** BigInt(local.decimals);
  if (denominator === 0n) {
    throw new RangeError('EUR→USD must be greater than 0.');
  }
  return Number(divideRoundHalfUpBigInt(numerator, denominator));
}

/**
 * The ECB euro foreign exchange reference rates for 2026-09-30, as published: units of each
 * currency per 1 EUR. Fetched once, by hand, from the ECB data API at `url`. Nothing fetches rates
 * at build, test or seed time (ADR 0006, *Determinism*).
 */
export const ecbReferenceRates = {
  date: '2026-09-30',
  url: 'https://data-api.ecb.europa.eu/service/data/EXR/D.USD+GBP+INR+BRL+JPY.EUR.SP00.A?startPeriod=2026-09-30&endPeriod=2026-09-30&format=csvdata',
  perEur: {
    USD: '1.1355',
    GBP: '0.85463',
    INR: '108.8205',
    BRL: '5.9077',
    JPY: '178.27',
  },
} as const;

/**
 * The exchange rate table (ADR 0001): local currency units per 1 USD, scaled by 10⁶. USD is exactly
 * 1. Every other rate is **derived** once from `ecbReferenceRates` with `deriveRatePerUsd` (EUR as
 * 1 ÷ EUR→USD) and stored here.
 */
export const exchangeRates = {
  source: 'ECB euro foreign exchange reference rates, derived to USD',
  asOf: ecbReferenceRates.date,
  ratesPerUsd: {
    USD: 1_000_000,
    GBP: 752_646,
    EUR: 880_669,
    INR: 95_834_875,
    BRL: 5_202_730,
    JPY: 156_996_918,
  },
} as const satisfies {
  source: string;
  asOf: string;
  ratesPerUsd: Record<CurrencyCode, number>;
};

/** Which rate table produced a response's USD figures (ADR 0003, *Money on the wire*). */
export const ratesSchema = z.strictObject({
  source: z.string().min(1),
  asOf: z.iso.date(),
});
export type Rates = z.infer<typeof ratesSchema>;
