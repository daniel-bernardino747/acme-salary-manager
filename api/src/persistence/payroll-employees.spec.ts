import { beforeEach, describe, expect, it } from 'vitest';
import { insertEmployee } from '../../test/builders';
import { createDb, type Db } from './db';
import { payrollEmployees } from './payroll-employees';

describe('payrollEmployees', () => {
  let db: Db;
  beforeEach(() => {
    db = createDb(':memory:');
  });

  it("reads every employee's country, department and salary, in their country's currency", () => {
    insertEmployee(db, { country: 'NL', department: 'Design', annualSalaryMinor: 64_000_00 });
    insertEmployee(db, { country: 'JP', department: 'Sales', annualSalaryMinor: 7_200_000 });

    const employees = payrollEmployees(db);

    expect(employees).toHaveLength(2);
    expect(employees).toEqual(
      expect.arrayContaining([
        {
          country: 'NL',
          department: 'Design',
          annualSalary: { amountMinor: 64_000_00, currency: 'EUR' },
        },
        {
          country: 'JP',
          department: 'Sales',
          annualSalary: { amountMinor: 7_200_000, currency: 'JPY' },
        },
      ]),
    );
  });
});
