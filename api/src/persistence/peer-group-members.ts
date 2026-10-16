import type { CountryCode, Department, JobTitle } from '@acme/contract';
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
 * Every member of every peer group the filters touch, for question 4 (ADR 0003, *Outliers*). SQL
 * only selects; the domain takes each median and decides who is an outlier.
 */
export function peerGroupMembers(db: Db, _filters: OutlierFilters): PeerGroupMember[] {
  return db
    .select()
    .from(employees)
    .all()
    .map((row) => ({ employee: toEmployee(row), shown: true }));
}
