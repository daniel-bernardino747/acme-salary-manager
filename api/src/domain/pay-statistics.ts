import type { CurrencyCode, Money } from '@acme/contract';
import { average, median } from './statistics';

/** The salaries of one peer group, in its country's currency (ADR 0002, *Where statistics are computed*). */
export interface PeerGroupSalaries {
  currency: CurrencyCode;
  salariesMinor: readonly number[];
}

/** Pay statistics for one peer group, each figure in the group's currency (ADR 0001). */
export interface PayStatistics {
  headcount: number;
  smallGroup: boolean;
  min: Money | null;
  median: Money | null;
  average: Money | null;
  max: Money | null;
}

/** The largest small group: its figures are shown but marked, and it is never checked for outliers. */
export const SMALL_GROUP_MAX_HEADCOUNT = 4;

/** A small group has 1 to 4 employees. An empty group is not one: it has no figures to mark. */
export function isSmallGroup(headcount: number): boolean {
  return headcount >= 1 && headcount <= SMALL_GROUP_MAX_HEADCOUNT;
}

/**
 * The pay statistics of one peer group, the median and average each rounded once by the rounding
 * rule. An empty group has null figures, never 0 (ADR 0001, *Edge cases*).
 */
export function payStatistics({ currency, salariesMinor }: PeerGroupSalaries): PayStatistics {
  const sorted = [...salariesMinor].sort((a, b) => a - b);
  const money = (amountMinor: number | null | undefined): Money | null =>
    amountMinor == null ? null : { amountMinor, currency };
  return {
    headcount: sorted.length,
    smallGroup: isSmallGroup(sorted.length),
    min: money(sorted[0]),
    median: money(median(sorted)),
    average: money(average(sorted)),
    max: money(sorted.at(-1)),
  };
}
