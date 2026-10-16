import { describe, expect, it } from 'vitest';
import {
  countries,
  countrySchema,
  currencies,
  departments,
  departmentSchema,
  jobTitles,
  jobTitleSchema,
} from './index.js';

describe('reference lists', () => {
  it('supports seven countries, each with its currency and minor-unit exponent', () => {
    expect(
      countries.map((c) => [c.code, c.name, c.currency, currencies[c.currency].exponent]),
    ).toEqual([
      ['US', 'United States', 'USD', 2],
      ['GB', 'United Kingdom', 'GBP', 2],
      ['DE', 'Germany', 'EUR', 2],
      ['NL', 'Netherlands', 'EUR', 2],
      ['IN', 'India', 'INR', 2],
      ['BR', 'Brazil', 'BRL', 2],
      ['JP', 'Japan', 'JPY', 0],
    ]);
  });

  it('stores the UK as GB', () => {
    expect(countrySchema.safeParse('GB').success).toBe(true);
    expect(countrySchema.safeParse('UK').success).toBe(false);
  });

  it('has nine departments', () => {
    expect(departments).toEqual([
      'Engineering',
      'Product',
      'Design',
      'Data',
      'Sales',
      'Marketing',
      'Customer Support',
      'People',
      'Finance',
    ]);
    expect(departmentSchema.safeParse('Legal').success).toBe(false);
  });

  it('has twenty-five job titles', () => {
    expect(jobTitles).toEqual([
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
    ]);
    expect(jobTitleSchema.safeParse('Software Engineer').success).toBe(false);
  });
});
