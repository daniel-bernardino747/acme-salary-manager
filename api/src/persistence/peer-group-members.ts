import type { CountryCode, Department, JobTitle } from '@acme/contract';
import { and, eq } from 'drizzle-orm';
import type { PeerGroupMember } from '../domain/outliers';
import type { Db } from './db';
import { toEmployee } from './to-employee';
import { employees } from './schema';

/** Question 4's filters: each one exact value, combined with AND (ADR 0003, *Outliers*). */
export interface OutlierFilters {
  country?: CountryCode;
  department?: Department;
  jobTitle?: JobTitle;
}

/**
 * Every member of every peer group the filters touch, for question 4 (ADR 0003, *Outliers*). A
 * country or a job title names whole peer groups, on the `(job_title, country)` index. SQL only
 * selects; the domain takes each median and decides who is an outlier.
 */
export function peerGroupMembers(db: Db, { country, jobTitle }: OutlierFilters): PeerGroupMember[] {
  return db
    .select()
    .from(employees)
    .where(
      and(country && eq(employees.country, country), jobTitle && eq(employees.jobTitle, jobTitle)),
    )
    .all()
    .map((row) => ({ employee: toEmployee(row), shown: true }));
}
