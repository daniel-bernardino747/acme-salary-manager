import { eq } from 'drizzle-orm';
import { describe, expect, it } from 'vitest';
import { insertEmployee } from '../../test/builders';
import { createDb } from './db';
import { employeesById } from './employees-by-id';
import { employees } from './schema';

describe('employeesById', () => {
  it('reads every employee back with its id, ordered by id', () => {
    const db = createDb(':memory:');
    const zoe = insertEmployee(db, {
      name: 'Zoë Visser',
      country: 'NL',
      annualSalaryMinor: 64_000_00,
    });
    const removed = insertEmployee(db, {
      name: 'Kenji Watanabe',
      country: 'JP',
      annualSalaryMinor: 7_000_000,
    });
    const aarav = insertEmployee(db, { name: 'Aarav Sharma' });
    db.delete(employees).where(eq(employees.id, removed.id)).run();

    expect(employeesById(db)).toEqual([zoe, aarav]);
  });
});
