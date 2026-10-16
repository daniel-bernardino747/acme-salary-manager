import type { EmployeeRequest, EmployeeResponse } from '@acme/contract';
import { eq } from 'drizzle-orm';
import type { Db } from './db';
import { employees } from './schema';
import { toEmployee } from './to-employee';

/** Replaces every field of the employee with this id, or returns `undefined` when there is none. */
export function replaceEmployee(
  db: Db,
  id: number,
  employee: EmployeeRequest,
): EmployeeResponse | undefined {
  const row = db.update(employees).set(employee).where(eq(employees.id, id)).returning().get();
  return row && toEmployee(row);
}
