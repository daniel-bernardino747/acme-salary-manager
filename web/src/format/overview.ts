import { countries, type Money } from '@acme/contract';
import { employeeCount } from './counts';
import { highestUsdFirst } from './payroll-copy';

/** How many underpaid employees the Overview names. */
const TOP_OUTLIERS = 5;

/** The first few of the API's ranking, most extreme first (ADR 0003, *Outliers*); never re-sorted. */
export function topOutliers<T>(ranked: readonly T[]): T[] {
  return ranked.slice(0, TOP_OUTLIERS);
}

/** A row of the Overview's share-of-payroll list, with its bar's width. */
export type ShareBar<T> = T & { width: number };

/**
 * Countries ranked by USD total, each with a bar drawn against the largest share, from 0 to 100.
 * The width comes from `sharePermille` as a plain number: geometry only, never shown as text (ADR
 * 0004, *Question 3*, as amended by #40). With no grand total there is no share, so no bar.
 */
export function shareBars<T extends { usd: Money; sharePermille: number | null }>(
  rows: readonly T[],
): ShareBar<T>[] {
  const ranked = highestUsdFirst(rows);
  const largest = Math.max(0, ...ranked.map((row) => row.sharePermille ?? 0));
  return ranked.map((row) => ({
    ...row,
    width: largest > 0 && row.sharePermille !== null ? (row.sharePermille / largest) * 100 : 0,
  }));
}

const today = new Intl.DateTimeFormat('en-US', {
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric',
});

/** The Overview's date line, e.g. "Friday, October 16, 2026 · 10,000 employees in 7 countries". */
export function overviewDateLine(date: Date, headcount: number): string {
  return `${today.format(date)} · ${employeeCount(headcount)} in ${countries.length} countries`;
}
