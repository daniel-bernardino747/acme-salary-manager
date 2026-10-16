import { createHash } from 'node:crypto';
import type { EmployeeRequest } from '@acme/contract';
import type { Db } from '../persistence/db';
import { employeesById } from '../persistence/employees-by-id';

/**
 * The SHA-256 of rows serialized canonically: one JSON array per row, its values in a fixed field
 * order, one row per line. Key order and whitespace never reach the hash.
 */
function hashRows(rows: readonly (readonly (string | number)[])[]): string {
  const hash = createHash('sha256');
  for (const row of rows) {
    hash.update(`${JSON.stringify(row)}\n`);
  }
  return hash.digest('hex');
}

const values = (e: EmployeeRequest) =>
  [e.name, e.jobTitle, e.department, e.country, e.annualSalaryMinor] as const;

/** The generator golden hash (ADR 0005, *Tests*): the generator's output, in its order. */
export function generatorGoldenHash(employees: readonly EmployeeRequest[]): string {
  return hashRows(employees.map(values));
}

/**
 * The database golden hash (ADR 0005, *Tests*): every row read back, ordered by id, with its id, so
 * identical ids are verified too.
 */
export function databaseGoldenHash(db: Db): string {
  return hashRows(employeesById(db).map((row) => [row.id, ...values(row)]));
}
