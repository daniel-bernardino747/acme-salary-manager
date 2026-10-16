import { eq } from 'drizzle-orm';
import { beforeEach, describe, expect, it } from 'vitest';
import { createDb, type Db } from './db';
import { employees } from './schema';

const employee = {
  name: 'João Müller',
  jobTitle: 'Data Analyst',
  department: 'Data',
  country: 'BR',
  annualSalaryMinor: 9_600_000,
} as const;

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
    const { id } = db.insert(employees).values(employee).returning().get();

    expect(matchingIds(db, '"muller"*')).toEqual([id]);
    expect(matchingIds(db, '"JOAO"*')).toEqual([id]);
  });

  it('replaces the old name when a name is updated', () => {
    const { id } = db.insert(employees).values(employee).returning().get();

    db.update(employees).set({ name: 'Ana Costa' }).where(eq(employees.id, id)).run();

    expect(matchingIds(db, '"muller"*')).toEqual([]);
    expect(matchingIds(db, '"costa"*')).toEqual([id]);
  });

  it('drops a deleted employee', () => {
    const { id } = db.insert(employees).values(employee).returning().get();

    db.delete(employees).where(eq(employees.id, id)).run();

    expect(matchingIds(db, '"muller"*')).toEqual([]);
  });
});
