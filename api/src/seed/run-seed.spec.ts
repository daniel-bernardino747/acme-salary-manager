import { describe, expect, it } from 'vitest';
import { createDb } from '../persistence/db';
import { employees } from '../persistence/schema';
import { runSeed } from './run-seed';

describe('seed command (stub)', () => {
  it('with --if-empty exits 0 and leaves the table empty', () => {
    const db = createDb(':memory:');
    const lines: string[] = [];

    const exitCode = runSeed(db, ['--if-empty'], (line) => lines.push(line));

    expect(exitCode).toBe(0);
    expect(db.select().from(employees).all()).toEqual([]);
  });
});
