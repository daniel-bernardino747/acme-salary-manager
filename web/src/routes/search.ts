import {
  countrySchema,
  departmentSchema,
  jobTitleSchema,
  type EmployeeListResponse,
} from '@acme/contract';
import { z } from 'zod';

/**
 * Reads a query string with every value kept as its text. The router's default parser turns
 * `?q=123` into a number and `?q=true` into a boolean, so a search could never be "123".
 */
export function parseSearch(search: string): Record<string, string> {
  return Object.fromEntries(new URLSearchParams(search));
}

/** Writes search params as text, leaving out unset ones. The inverse of `parseSearch`. */
export function stringifySearch(search: Record<string, unknown>): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(search)) {
    if (value !== undefined) {
      params.set(key, String(value));
    }
  }
  const query = params.toString();
  return query ? `?${query}` : '';
}

// URL search params are lenient (ADR 0004, *Routing*): each invalid or unknown value falls back to
// its default on its own, instead of showing an error page. So the UI never sends a bad value.

const page = z.coerce.number().int().min(1).default(1).catch(1);
const q = z.string().max(100).optional().catch(undefined);
const country = countrySchema.optional().catch(undefined);
const department = departmentSchema.optional().catch(undefined);
const jobTitle = jobTitleSchema.optional().catch(undefined);

export const employeesSearchSchema = z.object({ page, q, country, department, jobTitle });
export type EmployeesSearch = z.infer<typeof employeesSearchSchema>;

/** A new search or filter from the list's toolbar; `null` is a cleared filter. */
export interface EmployeesSearchChange {
  q?: string;
  country?: string | null;
  department?: string | null;
  jobTitle?: string | null;
}

/**
 * The list's search after a toolbar change: back on the first page, so it never lands past the end
 * (ADR 0004, *Routing*). A blank search or a cleared filter is unset, so it leaves the URL.
 */
export function changeEmployeesSearch(
  search: EmployeesSearch,
  change: EmployeesSearchChange,
): EmployeesSearch {
  const next = employeesSearchSchema.parse({ ...search, ...change, page: 1 });
  return next.q?.trim() ? next : { ...next, q: undefined };
}

/**
 * Where the list lands after a delete, given the page it was on as it reads now: one page back if
 * that page came back empty and is past the first (ADR 0004, *Data fetching*).
 */
export function employeesSearchAfterDelete(
  search: EmployeesSearch,
  page: Pick<EmployeeListResponse, 'items'>,
): EmployeesSearch {
  return page.items.length === 0 && search.page > 1 ? { ...search, page: search.page - 1 } : search;
}

/** `all` omits the API's `direction` parameter (ADR 0004, *Question 4*). */
export const outlierDirections = ['below', 'above', 'all'] as const;
const direction = z.enum(outlierDirections).default('below').catch('below');

export const outliersSearchSchema = z.object({ page, direction, country, department, jobTitle });
export type OutliersSearch = z.infer<typeof outliersSearchSchema>;

/** A new direction or filter on question 4; `null` is a cleared filter. */
export interface OutliersSearchChange {
  direction?: OutliersSearch['direction'];
  country?: string | null;
  department?: string | null;
  jobTitle?: string | null;
}

/**
 * Question 4's search after a direction or filter change: back on the first page (ADR 0004,
 * *Routing*). A cleared filter falls back to unset through the lenient schema, so it leaves the URL.
 */
export function changeOutliersSearch(
  search: OutliersSearch,
  change: OutliersSearchChange,
): OutliersSearch {
  return outliersSearchSchema.parse({ ...search, ...change, page: 1 });
}

/**
 * The employee list on question 4's filters, from its first page: "See all employees with these
 * filters" (ADR 0004, *Question 4*, as amended by #40). The direction has no meaning there.
 */
export function employeesSearchFromOutliers({
  country,
  department,
  jobTitle,
}: OutliersSearch): EmployeesSearch {
  return employeesSearchSchema.parse({ page: 1, country, department, jobTitle });
}

/** How many of the three filters are set, for the phone's "Filters" button. */
export function activeFilterCount(filters: {
  country?: string;
  department?: string;
  jobTitle?: string;
}): number {
  return [filters.country, filters.department, filters.jobTitle].filter(Boolean).length;
}

/** Question 1 picks both with no defaults: nothing is fetched until both are set. */
export const statisticsSearchSchema = z.object({ jobTitle, country });
export type StatisticsSearch = z.infer<typeof statisticsSearchSchema>;

/** Question 3 picks a title with no default. */
export const comparisonSearchSchema = z.object({ jobTitle });
export type ComparisonSearch = z.infer<typeof comparisonSearchSchema>;
