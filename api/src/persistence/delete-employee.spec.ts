import { beforeEach, describe, expect, it } from 'vitest';
import { anEmployee, insertEmployee } from '../../test/builders';
import { createEmployee } from './create-employee';
import { createDb, type Db } from './db';
import { deleteEmployee } from './delete-employee';

describe('deleteEmployee', () => {
  let db: Db;
  beforeEach(() => {
    db = createDb(':memory:');
  });

  it('never lets a later employee reuse the id of the deleted one with the highest id', () => {
    insertEmployee(db);
    const highest = insertEmployee(db, { name: 'Kenji Watanabe' }).id;

    deleteEmployee(db, highest);
    const next = createEmployee(db, anEmployee({ name: 'Ana Costa' }));

    expect(next.id).toBeGreaterThan(highest);
  });
});
