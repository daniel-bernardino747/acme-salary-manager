import type { Db } from '../persistence/db';
import { countEmployees } from '../persistence/count-employees';

/**
 * The seed command, as a stub until the generator lands (#15). `--if-empty` is the mode the start
 * sequence runs, so it already succeeds and inserts nothing. Returns the process exit code.
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
  log('Seed failed: only --if-empty is implemented yet.');
  return 1;
}
