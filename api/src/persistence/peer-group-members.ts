import type { CountryCode, Department, JobTitle } from '@acme/contract';
import { and, eq, exists, sql } from 'drizzle-orm';
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

/** A peer of the employee being read, to ask whether their group has anyone in the department. */
const peer = alias(employees, 'peer');

/**
 * Every member of every peer group the filters touch, for question 4 (ADR 0003, *Outliers*). A
 * country or a job title names whole peer groups. A department narrows who is shown, never the
 * peer group: every member of a group with someone in it is read, so each median covers the whole
 * group. Both use the `(job_title, country)` index. SQL only selects; the domain takes each median
 * and decides who is an outlier.
 */
export function peerGroupMembers(
  db: Db,
  { country, department, jobTitle }: OutlierFilters,
): PeerGroupMember[] {
  const groupHasDepartment =
    department &&
    exists(
      db
        .select({ one: sql`1` })
        .from(peer)
        .where(
          and(
            eq(peer.jobTitle, employees.jobTitle),
            eq(peer.country, employees.country),
            eq(peer.department, department),
          ),
        ),
    );
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
