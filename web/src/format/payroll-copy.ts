import { formatMoney, type Money } from '@acme/contract';
import { employeeCount } from './counts';
import { placeDecimal } from './place-decimal';

/**
 * A share of payroll as the domain rounded it, e.g. 421 → "42.1%" (ADR 0004, *Question 2*). No
 * share (a zero grand total) is "–", and a part that costs something never reads as "0.0%".
 */
export function shareText(sharePermille: number | null, total: Money): string {
  if (sharePermille === null) {
    return '–';
  }
  if (sharePermille === 0 && total.amountMinor > 0) {
    return '<0.1%';
  }
  return `${placeDecimal(sharePermille, 1)}%`;
}

/** The landing screen's first line, in whole USD (ADR 0001, *USD totals*; ADR 0004, *Question 2*). */
export function payrollHeadline({ headcount, usd }: { headcount: number; usd: Money }): string {
  return `Annual payroll: ${formatMoney(usd, 'en', { wholeUnits: true })} · ${employeeCount(headcount)}`;
}

/**
 * Payroll rows as a ranking: by USD total, highest first (ADR 0004, *Question 2*). A client-side
 * sort, not arithmetic. It is stable, so equal totals keep the API's fixed order.
 */
export function highestUsdFirst<T extends { usd: Money }>(rows: readonly T[]): T[] {
  return rows.toSorted((a, b) => {
    if (a.usd.amountMinor === b.usd.amountMinor) return 0;
    return a.usd.amountMinor > b.usd.amountMinor ? -1 : 1;
  });
}
