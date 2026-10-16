import { employeeRequestSchema } from '@acme/contract';
import type { Db } from '../persistence/db';
import { countEmployees } from '../persistence/count-employees';
import { insertEmployees } from '../persistence/insert-employees';
import { generateEmployees } from './generate-employees';

/** Validates every generated row like the API does, then inserts them all in one transaction. */
function seed(db: Db): void {
  const rows = generateEmployees().map((g) => employeeRequestSchema.parse(g.employee));
  db.transaction(() => insertEmployees(db, rows));
}

/**
 * The seed command (ADR 0005, *Running it*). `--if-empty` is the mode the start sequence runs.
 * Returns the process exit code.
 */
export function runSeed(db: Db, args: readonly string[], log: (line: string) => void): number {
  if (args.includes('--if-empty')) {
    const existing = countEmployees(db);
    log(
      existing > 0
        ? `Seed skipped: the table already has ${existing} employees.`
        : 'Seed skipped: the generator is not implemented yet.',
    );
    return 0;
  }
  seed(db);
  return 0;
}
