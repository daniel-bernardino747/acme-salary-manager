import { count } from 'drizzle-orm';
import type { Db } from './db';
import { employees } from './schema';

export function countEmployees(db: Db): number {
  return db.select({ n: count() }).from(employees).get()?.n ?? 0;
}
