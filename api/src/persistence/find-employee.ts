import type { EmployeeResponse } from '@acme/contract';
import { eq } from 'drizzle-orm';
import type { Db } from './db';
import { employees } from './schema';
import { toEmployee } from './to-employee';

/** The employee with this id, or `undefined` when there is none. */
export function findEmployee(db: Db, id: number): EmployeeResponse | undefined {
  const row = db.select().from(employees).where(eq(employees.id, id)).get();
  return row && toEmployee(row);
}
