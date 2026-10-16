import type { EmployeeRequest, EmployeeResponse } from '@acme/contract';
import type { Db } from './db';
import { employees } from './schema';
import { toEmployee } from './to-employee';

/** Adds an employee and returns it with the id the database gave it. */
export function createEmployee(db: Db, employee: EmployeeRequest): EmployeeResponse {
  return toEmployee(db.insert(employees).values(employee).returning().get());
}
