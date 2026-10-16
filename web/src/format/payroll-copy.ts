import type { CountryCode, Money, Rates } from '@acme/contract';
import { inCountry } from './pay-statistics-copy';
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

/** Rendered from the response's `rates`, so it names the table that produced the figures. */
export function payrollFootnote({ source, asOf }: Rates): string {
  return (
    `USD amounts converted at fixed rates from ${source}, as of ${asOf}. Each total is rounded on ` +
    'its own, so the parts may not add up exactly to the total, or to 100%.'
  );
}

/** A country row's link to its outliers, e.g. "Outliers in the Netherlands" (ADR 0004, *Question 2*). */
export function outliersInCountryText(country: CountryCode): string {
  return `Outliers ${inCountry(country)}`;
}
