import { sql } from 'drizzle-orm';
import type { Db } from './db';
import { employees } from './schema';

/**
 * Deletes every employee and resets the id sequence, so the next id is 1 (ADR 0006).
 * Shared by the seed's `--reset` and the HTTP tests.
 */
export function clearEmployees(db: Db): void {
  db.transaction((tx) => {
    tx.delete(employees).run();
    tx.run(sql`DELETE FROM sqlite_sequence WHERE name = 'employees'`);
  });
}
