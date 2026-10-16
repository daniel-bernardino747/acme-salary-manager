import { currencyOf, type JobTitle } from '@acme/contract';
import { eq } from 'drizzle-orm';
import type { CountrySalary } from '../domain/pay-comparison';
import type { Db } from './db';
import { employees } from './schema';

/**
 * The country and salary of everyone with one job title, for question 3, on the `(job_title,
 * country)` index (ADR 0002, *Where statistics are computed*). SQL only selects; the currency
 * follows from the country.
 */
export function jobTitleSalaries(db: Db, jobTitle: JobTitle): CountrySalary[] {
  return db
    .select({ country: employees.country, annualSalaryMinor: employees.annualSalaryMinor })
    .from(employees)
    .where(eq(employees.jobTitle, jobTitle))
    .all()
    .map(({ country, annualSalaryMinor }) => ({
      country,
      annualSalary: { amountMinor: annualSalaryMinor, currency: currencyOf(country) },
    }));
}
