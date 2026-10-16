import { eq } from 'drizzle-orm';
import { beforeEach, describe, expect, it } from 'vitest';
import { insertEmployee } from '../../test/builders';
import { createDb, type Db } from './db';
import { employees } from './schema';

/** Ids whose indexed name matches an FTS5 query, through the external-content index only. */
function matchingIds(db: Db, query: string): number[] {
  return db.$client
    .prepare<[string], { id: number }>(
      'SELECT rowid AS id FROM employees_fts WHERE employees_fts MATCH ? ORDER BY rowid',
    )
    .all(query)
    .map((row) => row.id);
}

describe('name search index', () => {
  let db: Db;
  beforeEach(() => {
    db = createDb(':memory:');
  });

  it('indexes a new employee, folding case and accents', () => {
    const { id } = insertEmployee(db, { name: 'João Müller' });

    expect(matchingIds(db, '"muller"*')).toEqual([id]);
    expect(matchingIds(db, '"JOAO"*')).toEqual([id]);
  });

  it('replaces the old name when a name is updated', () => {
    const { id } = insertEmployee(db, { name: 'João Müller' });

    db.update(employees).set({ name: 'Ana Costa' }).where(eq(employees.id, id)).run();

    expect(matchingIds(db, '"muller"*')).toEqual([]);
    expect(matchingIds(db, '"costa"*')).toEqual([id]);
  });

  it('drops a deleted employee', () => {
    const { id } = insertEmployee(db, { name: 'João Müller' });

    db.delete(employees).where(eq(employees.id, id)).run();

    expect(matchingIds(db, '"muller"*')).toEqual([]);
  });
});
