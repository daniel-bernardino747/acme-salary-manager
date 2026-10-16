import { divideRoundHalfUp } from '@acme/contract';
import { assertSafeInteger } from './rounding';

/** The thresholds in hundredths: strictly below 0.80 or strictly above 1.20 is an outlier. */
const LOWER_THRESHOLD_HUNDREDTHS = 80;
const UPPER_THRESHOLD_HUNDREDTHS = 120;

/** `percent · minor units`, asserted as a safe integer, so a cross-multiplication stays exact. */
function scaled(percent: number, minor: number): number {
  const product = percent * minor;
  assertSafeInteger(product, 'A cross-multiplied salary');
  return product;
}

/**
 * Whether a salary is strictly below 0.80 of the median: `100·salary < 80·median`, in integers,
 * against the median as shown (ADR 0001, *Outliers*).
 */
export function isBelowThreshold(salaryMinor: number, medianMinor: number): boolean {
  return scaled(100, salaryMinor) < scaled(LOWER_THRESHOLD_HUNDREDTHS, medianMinor);
}

/** Whether a salary is strictly above 1.20 of the median: `100·salary > 120·median`, in integers. */
export function isAboveThreshold(salaryMinor: number, medianMinor: number): boolean {
  return scaled(100, salaryMinor) > scaled(UPPER_THRESHOLD_HUNDREDTHS, medianMinor);
}

/**
 * The gap to 0.80 in minor units: the smallest salary with `100·salary ≥ 80·median`, less the
 * salary, as `(80·median + 99) div 100 − salary` (ADR 0003, *Money on the wire*). Only an underpaid
 * salary has one, so it is always at least one minor unit.
 */
export function gapMinor(salaryMinor: number, medianMinor: number): number {
  if (!isBelowThreshold(salaryMinor, medianMinor)) {
    throw new RangeError(`Only a salary below 0.80 of the median has a gap: ${salaryMinor}.`);
  }
  const target = scaled(LOWER_THRESHOLD_HUNDREDTHS, medianMinor) + 99;
  return (target - (target % 100)) / 100 - salaryMinor;
}

/**
 * A compa-ratio in hundredths, as the screen shows it: salary ÷ the peer median as shown, already
 * rounded (ADR 0001, *Outliers*). It never crosses a boundary: below 0.80 it rounds down, so 0.7996
 * shows 0.79, never 0.80, and above 1.20 it rounds up, so 1.2004 shows 1.21. Inside 0.80–1.20 it
 * rounds half up.
 */
export function compaRatioHundredths(salaryMinor: number, medianMinor: number): number {
  const salaryHundredths = scaled(100, salaryMinor);
  // Integer quotient and remainder, as the rounding rule takes them (ADR 0001, *Rounding*).
  const remainder = salaryHundredths % medianMinor;
  const quotient = (salaryHundredths - remainder) / medianMinor;
  if (isBelowThreshold(salaryMinor, medianMinor)) {
    return quotient;
  }
  if (isAboveThreshold(salaryMinor, medianMinor)) {
    return remainder === 0 ? quotient : quotient + 1;
  }
  return divideRoundHalfUp(salaryHundredths, medianMinor);
}
