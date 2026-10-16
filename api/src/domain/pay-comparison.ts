import { countries, exchangeRates, type CountryCode, type Money } from '@acme/contract';
import { toUsd, type RatesPerUsd, type UsdMoney } from './conversion';
import { payStatistics } from './pay-statistics';

/** One employee's salary as the comparison sees it: where they sit and what they are paid. */
export interface CountrySalary {
  country: CountryCode;
  annualSalary: Money;
}

/** One country's pay statistics for a job title, each figure in USD. */
export interface PayComparisonRow {
  country: CountryCode;
  headcount: number;
  smallGroup: boolean;
  min: UsdMoney | null;
  median: UsdMoney | null;
  average: UsdMoney | null;
  max: UsdMoney | null;
}

/**
 * Question 3: one job title's pay statistics in every supported country, in fixed order, in USD.
 * Each country's local figure is taken as shown and converted once, so a median or an average
 * carries two roundings (ADR 0001, *Edge cases*).
 */
export function payComparison(
  salaries: readonly CountrySalary[],
  ratesPerUsd: RatesPerUsd = exchangeRates.ratesPerUsd,
): PayComparisonRow[] {
  return countries.map(({ code, currency }) => {
    const statistics = payStatistics({
      currency,
      salariesMinor: salaries
        .filter((salary) => salary.country === code)
        .map((salary) => salary.annualSalary.amountMinor),
    });
    const usd = (figure: Money | null) => (figure === null ? null : toUsd(figure, ratesPerUsd));
    return {
      country: code,
      headcount: statistics.headcount,
      smallGroup: statistics.smallGroup,
      min: usd(statistics.min),
      median: usd(statistics.median),
      average: usd(statistics.average),
      max: usd(statistics.max),
    };
  });
}
