import { beforeEach, describe, expect, it } from 'vitest';
import { insertEmployee } from '../../test/builders';
import { countEmployees } from '../persistence/count-employees';
import { createDb, type Db } from '../persistence/db';
import { employeesById } from '../persistence/employees-by-id';
import { databaseGoldenHash } from './golden-hash';
import { runSeed } from './run-seed';

// The committed database golden hash (ADR 0005, *Tests*): the rows read back from a migrated
// `:memory:` database, ordered by id, with ids. It changes only with the generator golden hash.
const DATABASE_GOLDEN_HASH = '34fbc331a35f0ba6b951c5e6214777df5326fca2a745ff2e4cd0541e32e2b843';

describe('seed command', () => {
  let db: Db;
  let lines: string[];
  const seed = (args: string[]) => runSeed(db, args, (line) => lines.push(line));

  beforeEach(() => {
    db = createDb(':memory:');
    lines = [];
  });

  it('by default seeds an empty table with exactly 10,000 employees and exits 0', () => {
    expect(seed([])).toBe(0);

    expect(countEmployees(db)).toBe(10_000);
  });

  it('gives rows that, read back by id with their ids, match the committed database golden hash', () => {
    seed([]);

    expect(databaseGoldenHash(db)).toBe(DATABASE_GOLDEN_HASH);
  });

  it('prints the row count, the database golden hash and the duration', () => {
    seed([]);

    // The duration is wall-clock time, so only its form is checked (ADR 0006, *Determinism*).
    expect(lines).toEqual([
      expect.stringMatching(/^Seeded 10,000 employees in \d+ ms\.$/),
      `Database golden hash: ${DATABASE_GOLDEN_HASH}`,
    ]);
  });

  it('by default refuses a non-empty table, exits non-zero, points to --reset and leaves the rows', () => {
    insertEmployee(db);
    insertEmployee(db, { name: 'Kenji Watanabe', country: 'JP', annualSalaryMinor: 9_000_000 });
    const before = employeesById(db);

    expect(seed([])).toBe(1);

    expect(lines).toEqual([
      'Seed refused: the table already has 2 employees. Run with --reset to replace them.',
    ]);
    expect(employeesById(db)).toEqual(before);
  });

  it('with --if-empty seeds an empty table, as the start sequence needs', () => {
    expect(seed(['--if-empty'])).toBe(0);

    expect(countEmployees(db)).toBe(10_000);
    expect(databaseGoldenHash(db)).toBe(DATABASE_GOLDEN_HASH);
  });

  it('with --if-empty does nothing on a non-empty table, and exits 0', () => {
    insertEmployee(db);
    insertEmployee(db, { name: 'Kenji Watanabe', country: 'JP', annualSalaryMinor: 9_000_000 });
    const before = employeesById(db);

    expect(seed(['--if-empty'])).toBe(0);

    expect(lines).toEqual(['Seed skipped: the table already has 2 employees.']);
    expect(employeesById(db)).toEqual(before);
  });

  it('with --reset replaces a seeded and edited table, giving the same database golden hash as a fresh seed', () => {
    seed([]);
    insertEmployee(db);
    lines = [];

    expect(seed(['--reset'])).toBe(0);

    expect(countEmployees(db)).toBe(10_000);
    expect(databaseGoldenHash(db)).toBe(DATABASE_GOLDEN_HASH);
    expect(lines[1]).toBe(`Database golden hash: ${DATABASE_GOLDEN_HASH}`);
  });

  it('runs the reset and every insert in one transaction, so a failed seed leaves the previous data intact', () => {
    insertEmployee(db);
    insertEmployee(db, { name: 'Kenji Watanabe', country: 'JP', annualSalaryMinor: 9_000_000 });
    const before = employeesById(db);
    // A real SQLite failure halfway through the inserts, after the reset has run.
    db.$client.exec(`
      CREATE TRIGGER fail_halfway BEFORE INSERT ON employees
      WHEN (SELECT count(*) FROM employees) >= 5000
      BEGIN SELECT RAISE(ABORT, 'disk full'); END
    `);

    expect(() => seed(['--reset'])).toThrow(/disk full/);

    expect(employeesById(db)).toEqual(before);
    db.$client.exec('DROP TRIGGER fail_halfway');
    expect(insertEmployee(db).id).toBe(3);
  });
});
