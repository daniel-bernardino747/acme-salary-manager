import { beforeEach, describe, expect, it } from 'vitest';
import { insertEmployee } from '../../test/builders';
import { createDb, type Db } from '../persistence/db';
import { employees } from '../persistence/schema';
import { runSeed } from './run-seed';

describe('seed command (stub)', () => {
  let db: Db;
  let lines: string[];
  const seed = (args: string[]) => runSeed(db, args, (line) => lines.push(line));
  const rows = () => db.select().from(employees).all().length;

  beforeEach(() => {
    db = createDb(':memory:');
    lines = [];
  });

  it('with --if-empty on an empty table exits 0, says the generator is missing, and inserts nothing', () => {
    expect(seed(['--if-empty'])).toBe(0);

    expect(lines).toEqual(['Seed skipped: the generator is not implemented yet.']);
    expect(rows()).toBe(0);
  });

  it('with --if-empty on a non-empty table exits 0, says how many exist, and leaves them', () => {
    insertEmployee(db);
    insertEmployee(db, { name: 'Kenji Watanabe', country: 'JP', annualSalaryMinor: 9_000_000 });

    expect(seed(['--if-empty'])).toBe(0);

    expect(lines).toEqual(['Seed skipped: the table already has 2 employees.']);
    expect(rows()).toBe(2);
  });

  it('with no mode exits 1 and says only --if-empty is implemented', () => {
    expect(seed([])).toBe(1);

    expect(lines).toEqual(['Seed failed: only --if-empty is implemented yet.']);
  });
});
