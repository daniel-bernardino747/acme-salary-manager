import type { CountryCode, Money } from '@acme/contract';
import { countryName } from './country-name';

/** Highest median first; a country with no employees has no median, so it goes last. */
function byMedianUsd(a: { median: Money | null }, b: { median: Money | null }): number {
  if (a.median === null) {
    return b.median === null ? 0 : 1;
  }
  if (b.median === null) {
    return -1;
  }
  return b.median.amountMinor - a.median.amountMinor;
}

/**
 * Comparison rows as a ranking: by median USD, highest first, equal medians by country name, and
 * countries with no employees last (ADR 0004, *Question 3*). A client-side sort, not arithmetic.
 */
export function highestMedianFirst<T extends { country: CountryCode; median: Money | null }>(
  rows: readonly T[],
): T[] {
  return rows.toSorted(
    (a, b) =>
      byMedianUsd(a, b) || countryName(a.country).localeCompare(countryName(b.country), 'en'),
  );
}
