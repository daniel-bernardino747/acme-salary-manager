import path from 'node:path';
import Database from 'better-sqlite3';
import { drizzle, type BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import * as schema from './schema';

export type Db = BetterSQLite3Database<typeof schema> & { $client: Database.Database };

const BUSY_TIMEOUT_MS = 5000;

// Same relative path from src/persistence (tests) and dist/persistence (build).
const migrationsFolder = path.join(__dirname, '..', '..', 'drizzle');

/**
 * Opens the database at `filename` (or `:memory:`) and applies the committed migrations.
 * A file database runs in WAL mode and waits on a locked database instead of failing at once.
 */
export function createDb(filename: string): Db {
  const client = new Database(filename);
  if (filename !== ':memory:') {
    client.pragma('journal_mode = WAL');
    client.pragma(`busy_timeout = ${BUSY_TIMEOUT_MS}`);
  }
  const db = drizzle(client, { schema });
  migrate(db, { migrationsFolder });
  return db;
}
