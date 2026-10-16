import type { CountryCode, Department, JobTitle } from '@acme/contract';
import { and, eq, sql } from 'drizzle-orm';
import { alias } from 'drizzle-orm/sqlite-core';
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

/** The employees in the department, to find the peer groups that have anyone in it. */
const inDepartment = alias(employees, 'in_department');

/**
 * Every member of every peer group the filters touch, for question 4 (ADR 0003, *Outliers*). A
 * country or a job title names whole peer groups. A department narrows who is shown, never the
 * peer group: every member of a group with someone in it is read, so each median covers the whole
 * group. SQL only selects; the domain takes each median and decides who is an outlier.
 *
 * The department's groups come from one uncorrelated subquery on the department index, then each
 * group is read on the `(job_title, country)` index. A correlated `EXISTS` instead searches the
 * employee's whole group once per employee, which is far slower on the full seed.
 */
export function peerGroupMembers(
  db: Db,
  { country, department, jobTitle }: OutlierFilters,
): PeerGroupMember[] {
  const groupHasDepartment =
    department &&
    sql`(${employees.jobTitle}, ${employees.country}) in ${db
      .select({ jobTitle: inDepartment.jobTitle, country: inDepartment.country })
      .from(inDepartment)
      .where(eq(inDepartment.department, department))}`;
  return db
    .select()
    .from(employees)
    .where(
      and(
        country && eq(employees.country, country),
        jobTitle && eq(employees.jobTitle, jobTitle),
        groupHasDepartment,
      ),
    )
    .all()
    .map((row) => ({
      employee: toEmployee(row),
      shown: department === undefined || row.department === department,
    }));
}
