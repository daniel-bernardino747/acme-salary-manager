import { currencyOf } from '@acme/contract';
import type { PayrollEmployee } from '../domain/payroll-totals';
import type { Db } from './db';
import { employees } from './schema';

/**
 * Every employee's country, department and salary, for question 2 (ADR 0002, *Where statistics
 * are computed*). SQL only selects; the domain sums, and the currency follows from the country.
 */
export function payrollEmployees(db: Db): PayrollEmployee[] {
  return db
    .select({
      country: employees.country,
      department: employees.department,
      annualSalaryMinor: employees.annualSalaryMinor,
    })
    .from(employees)
    .all()
    .map(({ country, department, annualSalaryMinor }) => ({
      country,
      department,
      annualSalary: { amountMinor: annualSalaryMinor, currency: currencyOf(country) },
    }));
}
