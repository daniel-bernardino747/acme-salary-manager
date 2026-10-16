import { beforeEach, describe, expect, it } from 'vitest';
import { countEmployees } from '../persistence/count-employees';
import { createDb, type Db } from '../persistence/db';
import { runSeed } from './run-seed';

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
});
