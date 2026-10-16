import { describe, expect, it } from 'vitest';
import { anEmployee } from '../../test/builders';
import { createDb } from './db';
import { insertEmployees } from './insert-employees';
import { employees } from './schema';

describe('insertEmployees', () => {
  it('inserts the rows in the order given, so ids follow that order', () => {
    const db = createDb(':memory:');
    const rows = [
      anEmployee({ name: 'Zoë Visser', country: 'NL', annualSalaryMinor: 64_000_00 }),
      anEmployee({ name: 'Aarav Sharma' }),
      anEmployee({ name: 'Kenji Watanabe', country: 'JP', annualSalaryMinor: 7_000_000 }),
    ];

    insertEmployees(db, rows);

    expect(db.select().from(employees).orderBy(employees.id).all()).toEqual(
      rows.map((row, i) => ({ id: i + 1, ...row })),
    );
  });
});
