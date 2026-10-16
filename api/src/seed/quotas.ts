import {
  countries,
  jobTitles,
  type CountryCode,
  type Department,
  type JobTitle,
} from '@acme/contract';
import { homeDepartment } from './home-departments';

// ADR 0005, *Headcount: exact quotas*. Integers only: percentages are in tenths, multipliers in tenths.

export const countryTotals = {
  US: 2_800,
  GB: 1_300,
  DE: 1_100,
  NL: 500,
  IN: 2_600,
  BR: 1_000,
  JP: 700,
} as const satisfies Record<CountryCode, number>;

/** The global title mix, in tenths of a percent. It sums to 1,000. */
const titleMixPermille = {
  'Software Engineer I': 100,
  'Software Engineer II': 130,
  'Senior Software Engineer': 100,
  'Staff Software Engineer': 20,
  'Engineering Manager': 30,
  'QA Engineer': 40,
  'Product Manager': 30,
  'Senior Product Manager': 15,
  'Product Designer': 25,
  'Senior Product Designer': 10,
  'Data Analyst': 30,
  'Data Scientist': 20,
  'Senior Data Scientist': 10,
  'Sales Development Representative': 60,
  'Account Executive': 60,
  'Senior Account Executive': 30,
  'Sales Manager': 15,
  'Marketing Specialist': 40,
  'Marketing Manager': 15,
  'Customer Support Specialist': 130,
  'Support Team Lead': 15,
  Recruiter: 20,
  'HR Business Partner': 15,
  'Financial Analyst': 20,
  Accountant: 20,
} as const satisfies Record<JobTitle, number>;

type DepartmentTenths = Partial<Record<Department, number>>;

const hub: DepartmentTenths = {
  Engineering: 14,
  Data: 14,
  'Customer Support': 14,
  Sales: 4,
  Marketing: 4,
};
const market: DepartmentTenths = { Sales: 13, Marketing: 13 };
const plainMix: DepartmentTenths = {};

/** Country profiles: department multipliers in tenths, 10 where a department is not listed. */
const countryProfile = {
  US: market,
  GB: market,
  DE: market,
  NL: plainMix,
  IN: hub,
  BR: hub,
  JP: market,
} as const satisfies Record<CountryCode, DepartmentTenths>;

export interface Quota {
  jobTitle: JobTitle;
  country: CountryCode;
  count: number;
}

/**
 * None of the weighted cells fall under 5, so small groups are planted: each of these cells gets
 * exactly its count, and the rest of its country's total is spread over the other cells.
 */
export const smallGroupOverrides = [
  // Empty peer group: null stats, "no employees" in question 3.
  { jobTitle: 'Staff Software Engineer', country: 'BR', count: 0 },
  // Small group with an even-sized median.
  { jobTitle: 'Staff Software Engineer', country: 'NL', count: 2 },
  // Single-employee group.
  { jobTitle: 'Senior Data Scientist', country: 'JP', count: 1 },
  // Largest small group: shown, marked, never checked.
  { jobTitle: 'Sales Manager', country: 'NL', count: 4 },
  // Smallest checked group, pinned against weight changes.
  { jobTitle: 'Senior Data Scientist', country: 'NL', count: 5 },
] as const satisfies readonly Quota[];

function overrideFor(jobTitle: JobTitle, country: CountryCode): number | undefined {
  return smallGroupOverrides.find((o) => o.jobTitle === jobTitle && o.country === country)?.count;
}

function weight(jobTitle: JobTitle, country: CountryCode): number {
  const profile: DepartmentTenths = countryProfile[country];
  return titleMixPermille[jobTitle] * (profile[homeDepartment[jobTitle]] ?? 10);
}

/**
 * Spreads `total` over `weights` by largest remainder: each share is floored, then the units left
 * go to the largest remainders, earlier entries first on a tie. The result sums to `total` exactly.
 */
function largestRemainder(total: number, weights: readonly number[]): number[] {
  const weightSum = weights.reduce((a, b) => a + b, 0);
  const shares = weights.map((w, index) => ({
    index,
    count: Math.floor((total * w) / weightSum),
    remainder: (total * w) % weightSum,
  }));
  const left = total - shares.reduce((a, s) => a + s.count, 0);
  const byRemainder = [...shares].sort((a, b) => b.remainder - a.remainder || a.index - b.index);
  for (const share of byRemainder.slice(0, left)) {
    share.count += 1;
  }
  return shares.map((s) => s.count);
}

/**
 * The exact headcount of every title-and-country cell, countries then titles in reference-list
 * order. Pure and integer-only: the PRNG never touches headcount.
 */
export function headcountQuotas(): Quota[] {
  return countries.flatMap(({ code }) => {
    const free = jobTitles.filter((t) => overrideFor(t, code) === undefined);
    const overridden = jobTitles.reduce((sum, t) => sum + (overrideFor(t, code) ?? 0), 0);
    const counts = largestRemainder(
      countryTotals[code] - overridden,
      free.map((t) => weight(t, code)),
    );
    return jobTitles.map((jobTitle) => ({
      jobTitle,
      country: code,
      count: overrideFor(jobTitle, code) ?? counts[free.indexOf(jobTitle)] ?? 0,
    }));
  });
}
