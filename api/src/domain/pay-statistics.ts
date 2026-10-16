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

/** The pay statistics of one peer group, each figure rounded once by the rounding rule. */
export function payStatistics({ currency, salariesMinor }: PeerGroupSalaries): PayStatistics {
  const money = (amountMinor: number | null): Money | null =>
    amountMinor === null ? null : { amountMinor, currency };
  return {
    headcount: salariesMinor.length,
    smallGroup: false,
    min: money(Math.min(...salariesMinor)),
    median: money(median(salariesMinor)),
    average: money(average(salariesMinor)),
    max: money(Math.max(...salariesMinor)),
  };
}
