import { currencyOf, type EmployeeResponse } from '@acme/contract';
import type { employees } from './schema';

/** An employee with the salary as Money: the currency follows from the country (ADR 0002). */
export function toEmployee(row: typeof employees.$inferSelect): EmployeeResponse {
  const { annualSalaryMinor, ...employee } = row;
  return {
    ...employee,
    annualSalary: { amountMinor: annualSalaryMinor, currency: currencyOf(row.country) },
  };
}
