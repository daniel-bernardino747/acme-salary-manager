import { DEFAULT_PAGE_SIZE } from '@acme/contract';
import type { EmployeesSearch } from '../routes/search';

/**
 * `GET /api/employees` for the list's URL search, at the fixed page size (ADR 0004, *Employee list*).
 * A blank search is no search, so it is left out.
 */
export function employeesPath(search: EmployeesSearch): string {
  const params = new URLSearchParams({
    page: String(search.page),
    pageSize: String(DEFAULT_PAGE_SIZE),
  });
  if (search.q?.trim()) params.set('q', search.q);
  if (search.country) params.set('country', search.country);
  if (search.department) params.set('department', search.department);
  if (search.jobTitle) params.set('jobTitle', search.jobTitle);
  return `/api/employees?${params}`;
}

/** One employee's API resource: its view, edit and delete (ADR 0003, *Endpoints*). */
export function employeePath(id: number): string {
  return `/api/employees/${id}`;
}
