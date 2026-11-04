import { z } from 'zod';
import { employeeResponseSchema, MAX_ANNUAL_SALARY_MINOR } from './employee.js';
import { countrySchema, departmentSchema, jobTitleSchema } from './reference.js';

/** The list's page size when none is asked for, which the UI never changes (ADR 0004). */
export const DEFAULT_PAGE_SIZE = 25;
export const MAX_PAGE_SIZE = 100;
export const MAX_SEARCH_LENGTH = 100;

/**
 * The list's paging, name search and reference filters, shared with `GET /api/outliers`. Strict,
 * so a typo like `?contry=IN` is a 400, not silently ignored. Query values arrive as text, so the
 * page numbers are coerced. Each filter is one exact value from its reference list.
 */
export const employeeListFiltersSchema = z.strictObject({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(MAX_PAGE_SIZE).default(DEFAULT_PAGE_SIZE),
  /** A name search (ADR 0002, *Name search*). Empty once trimmed means no search. */
  q: z.string().trim().max(MAX_SEARCH_LENGTH).optional(),
  country: countrySchema.optional(),
  department: departmentSchema.optional(),
  jobTitle: jobTitleSchema.optional(),
});

/** One bound of an annual salary range: whole minor units, as a salary can be (CONTEXT.md). */
const salaryBound = z.coerce
  .number()
  .int()
  .min(1)
  .max(MAX_ANNUAL_SALARY_MINOR)
  .optional();

/**
 * `GET /api/employees` (ADR 0003, *Listing*): the filters above plus an annual salary range
 * (#46), all combined with AND. Both bounds are inclusive, are in the selected country's
 * currency, and so need a country. A minimum above the maximum is rejected.
 */
export const employeeListQuerySchema = employeeListFiltersSchema
  .extend({ minSalaryMinor: salaryBound, maxSalaryMinor: salaryBound })
  .refine(
    (query) =>
      query.country !== undefined ||
      (query.minSalaryMinor === undefined && query.maxSalaryMinor === undefined),
    { message: 'An annual salary range needs a country', path: ['country'] },
  )
  .refine(
    (query) =>
      query.minSalaryMinor === undefined ||
      query.maxSalaryMinor === undefined ||
      query.minSalaryMinor <= query.maxSalaryMinor,
    { message: 'The minimum must not exceed the maximum', path: ['minSalaryMinor'] },
  );
export type EmployeeListQuery = z.infer<typeof employeeListQuerySchema>;

/** One page of a list, with the total across all pages (ADR 0003, *Listing*). */
export function pageOf<T extends z.ZodType>(item: T) {
  return z.strictObject({
    items: z.array(item),
    page: z.int().min(1),
    pageSize: z.int().min(1).max(MAX_PAGE_SIZE),
    total: z.int().min(0),
  });
}

export const employeeListResponseSchema = pageOf(employeeResponseSchema);
export type EmployeeListResponse = z.infer<typeof employeeListResponseSchema>;
