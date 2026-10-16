import { employeeRequestSchema } from '@acme/contract';
import type { Db } from '../persistence/db';
import { clearEmployees } from '../persistence/clear-employees';
import { countEmployees } from '../persistence/count-employees';
import { insertEmployees } from '../persistence/insert-employees';
import { generateEmployees, type GeneratedEmployee } from './generate-employees';
import { databaseGoldenHash } from './golden-hash';

const count = new Intl.NumberFormat('en');

type Log = (line: string) => void;
type Generate = () => readonly GeneratedEmployee[];

/**
 * Validates every generated row like the API does, then, in one transaction, clears the table if
 * asked to (`clearEmployees`, which also restarts ids at 1) and inserts every row. A failed seed
 * leaves the previous data intact. Reports the row count, the database golden hash and the
 * duration.
 */
function seed(db: Db, reset: boolean, log: Log, generate: Generate): void {
  const start = performance.now();
  const rows = generate().map((g) => employeeRequestSchema.parse(g.employee));
  db.transaction(() => {
    if (reset) {
      clearEmployees(db);
    }
    insertEmployees(db, rows);
  });
  const ms = Math.round(performance.now() - start);
  log(`Seeded ${count.format(countEmployees(db))} employees in ${ms} ms.`);
  log(`Database golden hash: ${databaseGoldenHash(db)}`);
}

/**
 * The seed command (ADR 0005, *Running it*). `--if-empty` is the mode the start sequence runs.
 * Returns the process exit code.
 */
export function runSeed(
  db: Db,
  args: readonly string[],
  log: Log,
  generate: Generate = generateEmployees,
): number {
  const reset = args.includes('--reset');
  const existing = countEmployees(db);
  if (existing > 0 && args.includes('--if-empty')) {
    log(`Seed skipped: the table already has ${count.format(existing)} employees.`);
    return 0;
  }
  if (existing > 0 && !reset) {
    log(
      `Seed refused: the table already has ${count.format(existing)} employees. Run with --reset to replace them.`,
    );
    return 1;
  }
  seed(db, reset, log, generate);
  return 0;
}
