import type { EmployeeListQuery, EmployeeResponse } from '@acme/contract';
import { and, count, eq, getTableColumns, sql } from 'drizzle-orm';
import type { Db } from './db';
import { nameMatch } from './name-match';
import { employees } from './schema';
import { toEmployee } from './to-employee';

export interface EmployeeList {
  items: EmployeeResponse[];
  total: number;
}

/** The name index, which Drizzle's schema doesn't model (ADR 0002). */
const employeesFts = sql`employees_fts`;
const ftsRow = sql`employees_fts.rowid = ${employees.id}`;

/**
 * One page of employees in `name, id` order, with the total count (ADR 0003, *Listing*). Each
 * filter is an exact value, and they combine with AND, and with the name search. The list and the
 * count share the same join and conditions; a search joins the name index, and no search skips it.
 */
export function listEmployees(db: Db, query: EmployeeListQuery): EmployeeList {
  const match = nameMatch(query.q ?? '');
  const where = and(
    match === null ? undefined : sql`employees_fts MATCH ${match}`,
    query.country && eq(employees.country, query.country),
    query.department && eq(employees.department, query.department),
    query.jobTitle && eq(employees.jobTitle, query.jobTitle),
  );
  const list = db.select(getTableColumns(employees)).from(employees).$dynamic();
  const rows = (match === null ? list : list.innerJoin(employeesFts, ftsRow))
    .where(where)
    .orderBy(employees.name, employees.id)
    .limit(query.pageSize)
    .offset((query.page - 1) * query.pageSize)
    .all();
  const counted = db.select({ n: count() }).from(employees).$dynamic();
  const total =
    (match === null ? counted : counted.innerJoin(employeesFts, ftsRow)).where(where).get()?.n ?? 0;
  return { items: rows.map(toEmployee), total };
}
