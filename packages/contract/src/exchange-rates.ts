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
  const quotient = numerator / denominator;
  const remainder = numerator % denominator;
  const rate = 2n * remainder >= denominator ? quotient + 1n : quotient;
  return Number(rate);
}
