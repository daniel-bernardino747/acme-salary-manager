import {
  countrySchema,
  departmentSchema,
  jobTitleSchema,
  MAX_ANNUAL_SALARY_MINOR,
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

const salaryBound = z.coerce
  .number()
  .int()
  .min(1)
  .max(MAX_ANNUAL_SALARY_MINOR)
  .optional()
  .catch(undefined);

/**
 * The annual salary range (#46) is kept only when the API would take it: with a country, and with
 * the minimum at most the maximum. Otherwise both bounds are dropped.
 */
export const employeesSearchSchema = z
  .object({
    page,
    q,
    country,
    department,
    jobTitle,
    minSalaryMinor: salaryBound,
    maxSalaryMinor: salaryBound,
  })
  .transform((search) => {
    const { minSalaryMinor: min, maxSalaryMinor: max } = search;
    const valid =
      search.country !== undefined && (min === undefined || max === undefined || min <= max);
    return valid ? search : { ...search, minSalaryMinor: undefined, maxSalaryMinor: undefined };
  });
export type EmployeesSearch = z.infer<typeof employeesSearchSchema>;

/** A new search or filter from the list's toolbar; `null` is a cleared filter or bound. */
export interface EmployeesSearchChange {
  q?: string;
  country?: string | null;
  department?: string | null;
  jobTitle?: string | null;
  minSalaryMinor?: number | null;
  maxSalaryMinor?: number | null;
}

/**
 * The list's search after a toolbar change: back on the first page, so it never lands past the end
 * (ADR 0004, *Routing*). A blank search or a cleared filter is unset, so it leaves the URL. Any
 * country change clears the annual salary range, whose bounds are in the old country's currency.
 */
export function changeEmployeesSearch(
  search: EmployeesSearch,
  change: EmployeesSearchChange,
): EmployeesSearch {
  const range = 'country' in change ? { minSalaryMinor: undefined, maxSalaryMinor: undefined } : {};
  const next = employeesSearchSchema.parse({ ...search, ...range, ...change, page: 1 });
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

/**
 * How many filters are set, for the phone's "Filters" button: country, department, job title and
 * each salary bound (#46).
 */
export function activeFilterCount(filters: {
  country?: string;
  department?: string;
  jobTitle?: string;
  minSalaryMinor?: number;
  maxSalaryMinor?: number;
}): number {
  return [
    filters.country,
    filters.department,
    filters.jobTitle,
    filters.minSalaryMinor,
    filters.maxSalaryMinor,
  ].filter((value) => value !== undefined && value !== '').length;
}

/** Question 1 picks both with no defaults: nothing is fetched until both are set. */
export const statisticsSearchSchema = z.object({ jobTitle, country });
export type StatisticsSearch = z.infer<typeof statisticsSearchSchema>;

/** Question 3 picks a title with no default. */
export const comparisonSearchSchema = z.object({ jobTitle });
export type ComparisonSearch = z.infer<typeof comparisonSearchSchema>;
