import { beforeEach, describe, expect, it } from 'vitest';
import { insertEmployee } from '../../test/builders';
import { createDb, type Db } from './db';
import { listEmployees } from './list-employees';

const firstPage = { page: 1, pageSize: 25 };

describe('listEmployees', () => {
  let db: Db;
  beforeEach(() => {
    db = createDb(':memory:');
  });

  it("lists employees by name, each salary as Money in its country's currency, with the total", () => {
    const zoe = insertEmployee(db, {
      name: 'Zoë Visser',
      jobTitle: 'Data Analyst',
      department: 'Data',
      country: 'NL',
      annualSalaryMinor: 64_000_00,
    });
    const kenji = insertEmployee(db, {
      name: 'Kenji Watanabe',
      country: 'JP',
      annualSalaryMinor: 7_000_000,
    });

    expect(listEmployees(db, firstPage)).toEqual({
      items: [
        {
          id: kenji.id,
          name: 'Kenji Watanabe',
          jobTitle: 'Software Engineer II',
          department: 'Engineering',
          country: 'JP',
          annualSalary: { amountMinor: 7_000_000, currency: 'JPY' },
        },
        {
          id: zoe.id,
          name: 'Zoë Visser',
          jobTitle: 'Data Analyst',
          department: 'Data',
          country: 'NL',
          annualSalary: { amountMinor: 64_000_00, currency: 'EUR' },
        },
      ],
      total: 2,
    });
  });
});
