import { divideRoundHalfUp } from '@acme/contract';
import { assertSafeInteger } from './rounding';

/**
 * A compa-ratio in hundredths, as the screen shows it: salary ÷ the peer median as shown, already
 * rounded (ADR 0001, *Outliers*). Inside 0.80–1.20 it rounds half up.
 */
export function compaRatioHundredths(salaryMinor: number, medianMinor: number): number {
  const scaled = 100 * salaryMinor;
  assertSafeInteger(scaled, 'A salary in hundredths');
  return divideRoundHalfUp(scaled, medianMinor);
}
