import path from 'node:path';
import Database from 'better-sqlite3';
import { drizzle, type BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import * as schema from './schema';

export type Db = BetterSQLite3Database<typeof schema> & { $client: Database.Database };

// Same relative path from src/persistence (tests) and dist/persistence (build).
const migrationsFolder = path.join(__dirname, '..', '..', 'drizzle');

/** Opens the database at `filename` (or `:memory:`) and applies the committed migrations. */
export function createDb(filename: string): Db {
  const client = new Database(filename);
  const db = drizzle(client, { schema });
  migrate(db, { migrationsFolder });
  return db;
}
