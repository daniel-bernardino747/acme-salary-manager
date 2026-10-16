import { divideRoundHalfUp } from '@acme/contract';
import { assertSafeInteger } from './rounding';

/** The thresholds in hundredths: strictly below 0.80 or strictly above 1.20 is an outlier. */
export const LOWER_THRESHOLD_HUNDREDTHS = 80;

/** `percent · amount`, asserted as a safe integer, so a cross-multiplication never loses precision. */
function scaled(percent: number, amountMinor: number): number {
  const product = percent * amountMinor;
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

/**
 * A compa-ratio in hundredths, as the screen shows it: salary ÷ the peer median as shown, already
 * rounded (ADR 0001, *Outliers*). It never crosses a boundary: below 0.80 it rounds down, so 0.7996
 * shows 0.79, never 0.80. Inside 0.80–1.20 it rounds half up.
 */
export function compaRatioHundredths(salaryMinor: number, medianMinor: number): number {
  const salaryHundredths = scaled(100, salaryMinor);
  if (isBelowThreshold(salaryMinor, medianMinor)) {
    // Integer quotient, as the rounding rule takes it (ADR 0001, *Rounding*).
    return (salaryHundredths - (salaryHundredths % medianMinor)) / medianMinor;
  }
  return divideRoundHalfUp(salaryHundredths, medianMinor);
}
