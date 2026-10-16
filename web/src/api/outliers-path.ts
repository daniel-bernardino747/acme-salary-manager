import { DEFAULT_PAGE_SIZE } from '@acme/contract';
import type { OutliersSearch } from '../routes/search';

/**
 * `GET /api/outliers` for question 4's URL search, at the fixed page size (ADR 0004, *Question 4*).
 * All ranks both directions together, so it leaves the API's `direction` out.
 */
export function outliersPath(search: OutliersSearch): string {
  const params = new URLSearchParams({
    page: String(search.page),
    pageSize: String(DEFAULT_PAGE_SIZE),
  });
  if (search.direction !== 'all') params.set('direction', search.direction);
  if (search.country) params.set('country', search.country);
  if (search.department) params.set('department', search.department);
  if (search.jobTitle) params.set('jobTitle', search.jobTitle);
  return `/api/outliers?${params}`;
}
