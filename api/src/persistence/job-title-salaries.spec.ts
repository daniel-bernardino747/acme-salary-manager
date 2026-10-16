import { beforeEach, describe, expect, it } from 'vitest';
import { insertEmployee } from '../../test/builders';
import { createDb, type Db } from './db';
import { jobTitleSalaries } from './job-title-salaries';

describe('jobTitleSalaries', () => {
  let db: Db;
  beforeEach(() => {
    db = createDb(':memory:');
  });

  it("reads the country and salary of everyone with one job title, in their country's currency", () => {
    insertEmployee(db, { jobTitle: 'Accountant', country: 'DE', annualSalaryMinor: 62_000_00 });
    insertEmployee(db, { jobTitle: 'Accountant', country: 'JP', annualSalaryMinor: 6_800_000 });
    insertEmployee(db, { jobTitle: 'Financial Analyst', country: 'DE', annualSalaryMinor: 1_00 });

    const salaries = jobTitleSalaries(db, 'Accountant');

    expect(salaries).toHaveLength(2);
    expect(salaries).toEqual(
      expect.arrayContaining([
        { country: 'DE', annualSalary: { amountMinor: 62_000_00, currency: 'EUR' } },
        { country: 'JP', annualSalary: { amountMinor: 6_800_000, currency: 'JPY' } },
      ]),
    );
  });
});
