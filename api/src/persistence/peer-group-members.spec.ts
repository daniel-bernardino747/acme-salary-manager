import { beforeEach, describe, expect, it } from 'vitest';
import { insertEmployee } from '../../test/builders';
import { createDb, type Db } from './db';
import { peerGroupMembers } from './peer-group-members';

describe('peerGroupMembers', () => {
  let db: Db;
  beforeEach(() => {
    db = createDb(':memory:');
  });

  it("reads every employee with no filters, each shown, with the salary in their country's currency", () => {
    const priya = insertEmployee(db, { name: 'Priya Sharma', country: 'IN' });
    const hana = insertEmployee(db, {
      name: 'Hana Sato',
      jobTitle: 'Recruiter',
      department: 'People',
      country: 'JP',
      annualSalaryMinor: 5_400_000,
    });

    const members = peerGroupMembers(db, {});

    expect(members.toSorted((a, b) => a.employee.id - b.employee.id)).toEqual([
      {
        employee: {
          id: priya.id,
          name: 'Priya Sharma',
          jobTitle: 'Software Engineer II',
          department: 'Engineering',
          country: 'IN',
          annualSalary: { amountMinor: priya.annualSalaryMinor, currency: 'INR' },
        },
        shown: true,
      },
      {
        employee: {
          id: hana.id,
          name: 'Hana Sato',
          jobTitle: 'Recruiter',
          department: 'People',
          country: 'JP',
          annualSalary: { amountMinor: 5_400_000, currency: 'JPY' },
        },
        shown: true,
      },
    ]);
  });
});
