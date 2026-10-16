import { currencyOf, type EmployeeResponse } from '@acme/contract';
import { count } from 'drizzle-orm';
import type { Db } from './db';
import { employees } from './schema';

export interface EmployeeListQuery {
  page: number;
  pageSize: number;
}

export interface EmployeeList {
  items: EmployeeResponse[];
  total: number;
}

/** One page of employees in `name, id` order, with the total count (ADR 0003, *Listing*). */
export function listEmployees(db: Db, query: EmployeeListQuery): EmployeeList {
  const rows = db
    .select()
    .from(employees)
    .orderBy(employees.name, employees.id)
    .limit(query.pageSize)
    .offset((query.page - 1) * query.pageSize)
    .all();
  const total = db.select({ n: count() }).from(employees).get()?.n ?? 0;
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
