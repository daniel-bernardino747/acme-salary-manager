import type { Db } from './db';
import { employees } from './schema';

export type EmployeeRow = typeof employees.$inferSelect;

/** Every employee with its id, ordered by id: what the database golden hash reads (ADR 0005). */
export function employeesById(db: Db): EmployeeRow[] {
  return db.select().from(employees).orderBy(employees.id).all();
}
