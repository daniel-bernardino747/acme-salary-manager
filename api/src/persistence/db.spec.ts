import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { eq } from 'drizzle-orm';
import { describe, expect, it } from 'vitest';
import { insertEmployee } from '../../test/builders';
import { createDb } from './db';
import { employees } from './schema';

describe('createDb', () => {
  it('returns a migrated database whose salary CHECK rejects 0', () => {
    const db = createDb(':memory:');

    insertEmployee(db);
    expect(() => insertEmployee(db, { annualSalaryMinor: 0 })).toThrow(/CHECK constraint failed/);
  });

  it('never reuses the id of a deleted employee', () => {
    const db = createDb(':memory:');
    insertEmployee(db);
    const last = insertEmployee(db);

    db.delete(employees).where(eq(employees.id, last.id)).run();
    const next = insertEmployee(db);

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
