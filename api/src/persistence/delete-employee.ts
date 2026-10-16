import { eq } from 'drizzle-orm';
import type { Db } from './db';
import { employees } from './schema';

/**
 * Removes the employee with this id for good, and says whether there was one. `AUTOINCREMENT`
 * keeps the id from ever being given to someone else (ADR 0002, *Schema*).
 */
export function deleteEmployee(db: Db, id: number): boolean {
  return db.delete(employees).where(eq(employees.id, id)).run().changes > 0;
}
