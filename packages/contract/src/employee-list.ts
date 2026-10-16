import { z } from 'zod';
import { employeeResponseSchema } from './employee.js';
import { countrySchema, departmentSchema, jobTitleSchema } from './reference.js';

/** The list's page size when none is asked for, which the UI never changes (ADR 0004). */
export const DEFAULT_PAGE_SIZE = 25;
export const MAX_PAGE_SIZE = 100;
export const MAX_SEARCH_LENGTH = 100;

/**
 * `GET /api/employees` (ADR 0003, *Listing*). Strict, so a typo like `?contry=IN` is a 400, not
 * silently ignored. Query values arrive as text, so the page numbers are coerced. Each filter is
 * one exact value from its reference list, and they combine with AND.
 */
export const employeeListQuerySchema = z.strictObject({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(MAX_PAGE_SIZE).default(DEFAULT_PAGE_SIZE),
  /** A name search (ADR 0002, *Name search*). Empty once trimmed means no search. */
  q: z.string().trim().max(MAX_SEARCH_LENGTH).optional(),
  country: countrySchema.optional(),
  department: departmentSchema.optional(),
  jobTitle: jobTitleSchema.optional(),
});
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
