import { describe, expect, it } from 'vitest';
import { createDb } from './db';
import { employees } from './schema';

const validEmployee = {
  name: 'Priya Sharma',
  jobTitle: 'Software Engineer II',
  department: 'Engineering',
  country: 'IN',
  annualSalaryMinor: 2_400_000_00,
} as const;

describe('createDb', () => {
  it('returns a migrated database whose salary CHECK rejects 0', () => {
    const db = createDb(':memory:');

    db.insert(employees).values(validEmployee).run();
    expect(() =>
      db
        .insert(employees)
        .values({ ...validEmployee, annualSalaryMinor: 0 })
        .run(),
    ).toThrow(/CHECK constraint failed/);
  });
});
