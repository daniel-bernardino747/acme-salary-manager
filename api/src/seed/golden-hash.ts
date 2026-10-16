import { createHash } from 'node:crypto';
import type { EmployeeRequest } from '@acme/contract';

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
