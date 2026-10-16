import { divideRoundHalfUp } from '@acme/contract';
import { sumMinor } from './rounding';

/**
 * The median salary in minor units: the middle value, or the mean of the two middle values of an
 * even-sized set rounded half up once. `null` for an empty set, never 0 (ADR 0001).
 */
export function median(salaries: readonly number[]): number | null {
  const sorted = [...salaries].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  const upper = sorted[middle];
  if (upper === undefined) {
    return null;
  }
  const lower = sorted[middle - 1];
  // `lower` is missing only for a single salary, which is odd-sized anyway.
  if (sorted.length % 2 === 1 || lower === undefined) {
    return upper;
  }
  return divideRoundHalfUp(sumMinor([lower, upper]), 2);
}

/** The average salary in minor units, rounded half up once. `null` for an empty set, never 0. */
export function average(salaries: readonly number[]): number | null {
  if (salaries.length === 0) {
    return null;
  }
  return divideRoundHalfUp(sumMinor(salaries), salaries.length);
}
