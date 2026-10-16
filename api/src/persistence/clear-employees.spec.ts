import { describe, expect, it } from 'vitest';
import { insertEmployee } from '../../test/builders';
import { clearEmployees } from './clear-employees';
import { createDb } from './db';
import { employees } from './schema';

describe('clearEmployees', () => {
  it('empties the table and restarts ids at 1', () => {
    const db = createDb(':memory:');
    insertEmployee(db);
    insertEmployee(db, { name: 'Kenji Watanabe', country: 'JP', annualSalaryMinor: 9_000_000 });

    clearEmployees(db);

    expect(db.select().from(employees).all()).toEqual([]);
    expect(insertEmployee(db).id).toBe(1);
  });
});
