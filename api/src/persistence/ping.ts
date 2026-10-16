import { sql } from 'drizzle-orm';
import type { Db } from './db';

/** Runs `SELECT 1`, throwing if the database cannot answer. */
export function ping(db: Db): void {
  db.get(sql`SELECT 1`);
}
