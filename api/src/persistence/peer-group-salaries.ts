import { currencyOf, type CountryCode, type JobTitle } from '@acme/contract';
import { and, eq } from 'drizzle-orm';
import type { PeerGroupSalaries } from '../domain/pay-statistics';
import type { Db } from './db';
import { employees } from './schema';

export interface PeerGroup {
  jobTitle: JobTitle;
  country: CountryCode;
}

/**
 * The salaries of one peer group, on the `(job_title, country)` index (ADR 0002, *Where statistics
 * are computed*). SQL only selects; the currency follows from the country.
 */
export function peerGroupSalaries(db: Db, { jobTitle, country }: PeerGroup): PeerGroupSalaries {
  const rows = db
    .select({ annualSalaryMinor: employees.annualSalaryMinor })
    .from(employees)
    .where(and(eq(employees.jobTitle, jobTitle), eq(employees.country, country)))
    .all();
  return { currency: currencyOf(country), salariesMinor: rows.map((row) => row.annualSalaryMinor) };
}
