import { sql } from 'drizzle-orm';
import type { Db } from './db';
import { employees } from './schema';

export type NewEmployee = Omit<typeof employees.$inferInsert, 'id'>;

/**
 * Inserts the rows in the order given, in one transaction, running one prepared statement per row
 * (ADR 0005, *Running it*). Called inside an open transaction, it becomes a savepoint of it.
 */
export function insertEmployees(db: Db, rows: readonly NewEmployee[]): void {
  const insert = db
    .insert(employees)
    .values({
      name: sql.placeholder('name'),
      jobTitle: sql.placeholder('jobTitle'),
      department: sql.placeholder('department'),
      country: sql.placeholder('country'),
      annualSalaryMinor: sql.placeholder('annualSalaryMinor'),
    })
    .prepare();
  db.transaction(() => {
    for (const row of rows) {
      insert.run(row);
    }
  });
}
