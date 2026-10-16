import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { eq } from 'drizzle-orm';
import { describe, expect, it } from 'vitest';
import { createDb } from './db';
import { employees } from './schema';

const validEmployee = {
  name: 'Priya Sharma',
  jobTitle: 'Software Engineer II',
  department: 'Engineering',
  country: 'IN',
  annualSalaryMinor: 2_400_000_00,
} as const;

describe('createDb', () => {
  it('returns a migrated database whose salary CHECK rejects 0', () => {
    const db = createDb(':memory:');

    db.insert(employees).values(validEmployee).run();
    expect(() =>
      db
        .insert(employees)
        .values({ ...validEmployee, annualSalaryMinor: 0 })
        .run(),
    ).toThrow(/CHECK constraint failed/);
  });

  it('never reuses the id of a deleted employee', () => {
    const db = createDb(':memory:');
    db.insert(employees).values(validEmployee).run();
    const last = db.insert(employees).values(validEmployee).returning().get();

    db.delete(employees).where(eq(employees.id, last.id)).run();
    const next = db.insert(employees).values(validEmployee).returning().get();

    expect(next.id).toBe(last.id + 1);
  });

  it('opens a file database in WAL mode with a busy timeout', () => {
    const dir = mkdtempSync(path.join(tmpdir(), 'acme-db-'));
    const db = createDb(path.join(dir, 'acme.db'));
    try {
      expect(db.$client.pragma('journal_mode', { simple: true })).toBe('wal');
      expect(db.$client.pragma('busy_timeout', { simple: true })).toBe(5000);
    } finally {
      db.$client.close();
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
