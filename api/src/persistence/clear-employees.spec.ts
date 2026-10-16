import { describe, expect, it } from 'vitest';
import { insertEmployee } from '../../test/builders';
import { matchingIds } from '../../test/fts';
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

  it('empties the name search index too', () => {
    const db = createDb(':memory:');
    const priya = insertEmployee(db, { name: 'Priya Sharma' });
    insertEmployee(db, { name: 'Kenji Watanabe', country: 'JP', annualSalaryMinor: 9_000_000 });
    expect(matchingIds(db, '"sharma"*')).toEqual([priya.id]);

    clearEmployees(db);

    expect(matchingIds(db, '"sharma"*')).toEqual([]);
    expect(matchingIds(db, '"watanabe"*')).toEqual([]);
  });
});
