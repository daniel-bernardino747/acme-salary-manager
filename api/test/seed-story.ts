import { currencyOf, type CurrencyCode } from '@acme/contract';
import { toUsd, type UsdMoney } from '../src/domain/conversion';
import { baseSalaryMinor, salaryStepMinor } from '../src/seed/base-salaries';
import { plantedOutliers } from '../src/seed/plants';

/**
 * Question 4's cost to reach 0.80 on the default seed, worked out from the planted constants and
 * the anchored medians, never through the domain function it checks (ADR 0005, *Tests*). The seed
 * story test and the end-to-end test both expect it (ADR 0006).
 *
 * Every planted group is median-anchored, so its median is its base salary. A planted salary is
 * target × base, rounded half up to a whole step. A base is a whole number of 100-unit steps, so
 * 0.80 × base is a whole minor unit and the gap is exactly 0.80 × base − salary.
 */
export function plantedCostToReachThreshold(): UsdMoney {
  const gapsByCurrency = new Map<CurrencyCode, number>();
  for (const plant of plantedOutliers.filter((p) => p.direction === 'below')) {
    const base = baseSalaryMinor(plant.jobTitle, plant.country);
    const step = salaryStepMinor(plant.country);
    const salary = Math.floor(((base / step) * plant.targetHundredths + 50) / 100) * step;
    const gap = (80 * base) / 100 - salary;
    if (!Number.isInteger(gap) || gap < 1) {
      throw new RangeError(`${plant.jobTitle} · ${plant.country}: the planted gap is ${gap}.`);
    }
    const currency = currencyOf(plant.country);
    gapsByCurrency.set(currency, (gapsByCurrency.get(currency) ?? 0) + gap);
  }
  let cents = 0;
  for (const [currency, amountMinor] of gapsByCurrency) {
    cents += toUsd({ amountMinor, currency }).amountMinor;
  }
  return { amountMinor: cents, currency: 'USD' };
}
