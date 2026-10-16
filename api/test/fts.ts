import type { Db } from '../src/persistence/db';

/** Ids whose indexed name matches an FTS5 query, through the external-content index only. */
export function matchingIds(db: Db, query: string): number[] {
  return db.$client
    .prepare<[string], { id: number }>(
      'SELECT rowid AS id FROM employees_fts WHERE employees_fts MATCH ? ORDER BY rowid',
    )
    .all(query)
    .map((row) => row.id);
}
