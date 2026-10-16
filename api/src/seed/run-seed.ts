import { employeeRequestSchema } from '@acme/contract';
import type { Db } from '../persistence/db';
import { countEmployees } from '../persistence/count-employees';
import { insertEmployees } from '../persistence/insert-employees';
import { generateEmployees } from './generate-employees';
import { databaseGoldenHash } from './golden-hash';

const count = new Intl.NumberFormat('en');

/**
 * Validates every generated row like the API does, then inserts them all in one transaction, and
 * reports the row count, the database golden hash and the duration.
 */
function seed(db: Db, log: (line: string) => void): void {
  const start = performance.now();
  const rows = generateEmployees().map((g) => employeeRequestSchema.parse(g.employee));
  db.transaction(() => insertEmployees(db, rows));
  const ms = Math.round(performance.now() - start);
  log(`Seeded ${count.format(countEmployees(db))} employees in ${ms} ms.`);
  log(`Database golden hash: ${databaseGoldenHash(db)}`);
}

/**
 * The seed command (ADR 0005, *Running it*). `--if-empty` is the mode the start sequence runs.
 * Returns the process exit code.
 */
export function runSeed(db: Db, args: readonly string[], log: (line: string) => void): number {
  const existing = countEmployees(db);
  if (existing > 0 && args.includes('--if-empty')) {
    log(`Seed skipped: the table already has ${count.format(existing)} employees.`);
    return 0;
  }
  if (existing > 0) {
    log(
      `Seed refused: the table already has ${count.format(existing)} employees. Run with --reset to replace them.`,
    );
    return 1;
  }
  seed(db, log);
  return 0;
}
