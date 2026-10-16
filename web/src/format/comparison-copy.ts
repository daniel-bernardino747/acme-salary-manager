import type { CountryCode, Money, Rates } from '@acme/contract';
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

/** One bar of the median chart, keyed by the country's name, which labels its axis. */
export interface MedianBar {
  country: string;
  medianUsdMinor: number;
  smallGroup: boolean;
}

/**
 * The chart's bars, in the order given, leaving out countries with no employees (ADR 0004,
 * *Question 3*). The median's cents are bar length only: geometry, never shown as money.
 */
export function medianBars(
  rows: readonly { country: CountryCode; median: Money | null; smallGroup: boolean }[],
): MedianBar[] {
  return rows.flatMap(({ country, median, smallGroup }) =>
    median === null
      ? []
      : [{ country: countryName(country), medianUsdMinor: median.amountMinor, smallGroup }],
  );
}

/**
 * Rendered from the response's `rates`. The figures carry two roundings and a fixed rate, and
 * purchasing power is out of scope, so the footnote says both (ADR 0004, *Question 3*).
 */
export function comparisonFootnote({ source, asOf }: Rates): string {
  return (
    `Converted to USD at fixed rates from ${source}, as of ${asOf}. Each figure is converted from ` +
    'the local figure as shown, so it may differ slightly from converting individual salaries. ' +
    'Amounts are nominal, not adjusted for cost of living.'
  );
}
