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

/** One global ladder, Software Engineer II = 1.00. */
const multiplier = {
  'Software Engineer I': 0.8,
  'Software Engineer II': 1,
  'Senior Software Engineer': 1.3,
  'Staff Software Engineer': 1.65,
  'Engineering Manager': 1.55,
  'QA Engineer': 0.9,
  'Product Manager': 1.1,
  'Senior Product Manager': 1.4,
  'Product Designer': 0.95,
  'Senior Product Designer': 1.25,
  'Data Analyst': 0.85,
  'Data Scientist': 1.1,
  'Senior Data Scientist': 1.4,
  'Sales Development Representative': 0.65,
  'Account Executive': 0.95,
  'Senior Account Executive': 1.25,
  'Sales Manager': 1.45,
  'Marketing Specialist': 0.75,
  'Marketing Manager': 1.15,
  'Customer Support Specialist': 0.55,
  'Support Team Lead': 0.75,
  Recruiter: 0.75,
  'HR Business Partner': 1,
  'Financial Analyst': 0.85,
  Accountant: 0.8,
} as const satisfies Record<JobTitle, number>;

/** Seniority spread per country: senior roles in IN and BR sit closer to US pay than junior ones. */
const spread = {
  US: 1,
  GB: 1,
  DE: 1,
  NL: 1,
  IN: 1.35,
  BR: 1.25,
  JP: 1.15,
} as const satisfies Record<CountryCode, number>;

/** The salary step in minor units: 100 major units, and ¥10,000 for JPY. */
export function salaryStepMinor(country: CountryCode): number {
  const currency = currencyOf(country);
  return currency === 'JPY' ? 10_000 : 100 * 10 ** currencies[currency].exponent;
}

/**
 * Per-cell base overrides, in minor units. Empty: it exists for a cell that looks wrong in the base
 * snapshot (ADR 0005).
 */
const baseOverrides: readonly { jobTitle: JobTitle; country: CountryCode; baseMinor: number }[] =
  [];

const minorPerMajor = (country: CountryCode) => 10 ** currencies[currencyOf(country)].exponent;

/**
 * The base salary of a title in a country, in minor units: `roundToStep(anchor · multiplier ^
 * spread)`, half up. `Math.pow` is the seed's only floating-point operation, and engines only
 * approximate it, so the base snapshot test guards it: any drift fails instead of silently changing
 * the data (ADR 0005).
 */
export function baseSalaryMinor(jobTitle: JobTitle, country: CountryCode): number {
  const override = baseOverrides.find((o) => o.jobTitle === jobTitle && o.country === country);
  if (override) {
    return override.baseMinor;
  }
  const stepMinor = salaryStepMinor(country);
  const anchorSteps = (anchorMajor[country] * minorPerMajor(country)) / stepMinor;
  const steps = Math.round(anchorSteps * Math.pow(multiplier[jobTitle], spread[country]));
  return steps * stepMinor;
}
