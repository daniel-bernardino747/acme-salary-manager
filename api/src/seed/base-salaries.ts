import { currencies, currencyOf, type CountryCode, type JobTitle } from '@acme/contract';

// ADR 0005, *Base salaries*. Illustrative figures, hand-picked to be plausible, not market data.

/** The base salary of a Software Engineer II, in whole major units of the country's currency. */
const anchorMajor = {
  US: 130_000,
  GB: 62_000,
  DE: 68_000,
  NL: 64_000,
  IN: 1_800_000,
  BR: 156_000,
  JP: 7_000_000,
} as const satisfies Record<CountryCode, number>;

/** The salary step in minor units: 100 major units, and ¥10,000 for JPY. */
export function salaryStepMinor(country: CountryCode): number {
  const currency = currencyOf(country);
  return currency === 'JPY' ? 10_000 : 100 * 10 ** currencies[currency].exponent;
}

/** The base salary of a title in a country, in minor units: a whole number of salary steps. */
export function baseSalaryMinor(_jobTitle: JobTitle, country: CountryCode): number {
  return anchorMajor[country] * 10 ** currencies[currencyOf(country)].exponent;
}
