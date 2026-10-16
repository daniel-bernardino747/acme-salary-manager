import {
  currencyOf,
  type CountryCode,
  type Department,
  type EmployeeResponse,
  type JobTitle,
} from '@acme/contract';
import { and, count, eq } from 'drizzle-orm';
import type { Db } from './db';
import { employees } from './schema';

export interface EmployeeListQuery {
  page: number;
  pageSize: number;
  country?: CountryCode;
  department?: Department;
  jobTitle?: JobTitle;
}

export interface EmployeeList {
  items: EmployeeResponse[];
  total: number;
}

/**
 * One page of employees in `name, id` order, with the total count (ADR 0003, *Listing*). Each
 * filter is an exact value, and they combine with AND.
 */
export function listEmployees(db: Db, query: EmployeeListQuery): EmployeeList {
  const where = and(
    query.country && eq(employees.country, query.country),
    query.department && eq(employees.department, query.department),
    query.jobTitle && eq(employees.jobTitle, query.jobTitle),
  );
  const rows = db
    .select()
    .from(employees)
    .where(where)
    .orderBy(employees.name, employees.id)
    .limit(query.pageSize)
    .offset((query.page - 1) * query.pageSize)
    .all();
  const total = db.select({ n: count() }).from(employees).where(where).get()?.n ?? 0;
  return { items: rows.map(toEmployee), total };
}

/** An employee with the salary as Money: the currency follows from the country (ADR 0002). */
function toEmployee(row: typeof employees.$inferSelect): EmployeeResponse {
  const { annualSalaryMinor, ...employee } = row;
  return {
    ...employee,
    annualSalary: { amountMinor: annualSalaryMinor, currency: currencyOf(row.country) },
  };
}
