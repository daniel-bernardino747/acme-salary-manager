import { z } from 'zod';

// Reference data (ADR 0001, ADR 0005 "Reference lists"). Changing a list is a code change and a deploy.

/** ISO 4217 currencies with their minor-unit exponent. */
export const currencies = {
  USD: { exponent: 2 },
  GBP: { exponent: 2 },
  EUR: { exponent: 2 },
  INR: { exponent: 2 },
  BRL: { exponent: 2 },
  JPY: { exponent: 0 },
} as const;

export type CurrencyCode = keyof typeof currencies;

/** Supported countries in their fixed display order. The UK is stored as GB. */
export const countries = [
  { code: 'US', name: 'United States', currency: 'USD' },
  { code: 'GB', name: 'United Kingdom', currency: 'GBP' },
  { code: 'DE', name: 'Germany', currency: 'EUR' },
  { code: 'NL', name: 'Netherlands', currency: 'EUR' },
  { code: 'IN', name: 'India', currency: 'INR' },
  { code: 'BR', name: 'Brazil', currency: 'BRL' },
  { code: 'JP', name: 'Japan', currency: 'JPY' },
] as const satisfies readonly { code: string; name: string; currency: CurrencyCode }[];

export type CountryCode = (typeof countries)[number]['code'];
export const countrySchema = z.enum(
  countries.map((c) => c.code) as [CountryCode, ...CountryCode[]],
);

/** The currency a country's salaries are in. */
export function currencyOf(country: CountryCode): CurrencyCode {
  const found = countries.find((c) => c.code === country);
  if (!found) {
    throw new RangeError(`Unsupported country: ${country}.`);
  }
  return found.currency;
}

export const departments = [
  'Engineering',
  'Product',
  'Design',
  'Data',
  'Sales',
  'Marketing',
  'Customer Support',
  'People',
  'Finance',
] as const;
export const departmentSchema = z.enum(departments);
export type Department = z.infer<typeof departmentSchema>;

export const jobTitles = [
  'Software Engineer I',
  'Software Engineer II',
  'Senior Software Engineer',
  'Staff Software Engineer',
  'Engineering Manager',
  'QA Engineer',
  'Product Manager',
  'Senior Product Manager',
  'Product Designer',
  'Senior Product Designer',
  'Data Analyst',
  'Data Scientist',
  'Senior Data Scientist',
  'Sales Development Representative',
  'Account Executive',
  'Senior Account Executive',
  'Sales Manager',
  'Marketing Specialist',
  'Marketing Manager',
  'Customer Support Specialist',
  'Support Team Lead',
  'Recruiter',
  'HR Business Partner',
  'Financial Analyst',
  'Accountant',
] as const;
export const jobTitleSchema = z.enum(jobTitles);
export type JobTitle = z.infer<typeof jobTitleSchema>;
