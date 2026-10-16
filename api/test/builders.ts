import type { CountryCode, Department, JobTitle } from '@acme/contract';
import type { Db } from '../src/persistence/db';
import { employees } from '../src/persistence/schema';

export interface EmployeeRow {
  name: string;
  jobTitle: JobTitle;
  department: Department;
  country: CountryCode;
  annualSalaryMinor: number;
}

/** A valid employee, with any field overridden. */
export function anEmployee(overrides: Partial<EmployeeRow> = {}): EmployeeRow {
  return {
    name: 'Priya Sharma',
    jobTitle: 'Software Engineer II',
    department: 'Engineering',
    country: 'IN',
    annualSalaryMinor: 2_400_000_00,
    ...overrides,
  };
}

/** Inserts a valid employee and returns it with its id. */
export function insertEmployee(db: Db, overrides: Partial<EmployeeRow> = {}) {
  return db.insert(employees).values(anEmployee(overrides)).returning().get();
}
