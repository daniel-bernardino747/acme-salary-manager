import { DEFAULT_PAGE_SIZE } from '@acme/contract';

/** One entry of the fixed request list: a `GET` path under the base URL. */
export interface PerfRequest {
  label: string;
  path: string;
}

/** Always timed first: its response gives the row count that locates the last page. */
export const FIRST_PAGE: PerfRequest = { label: 'Employees, first page', path: '/api/employees' };

const get = (label: string, endpoint: string, query: Record<string, string> = {}): PerfRequest => {
  const search = new URLSearchParams(query).toString();
  return { label, path: search ? `${endpoint}?${search}` : endpoint };
};

// Software Engineer II · IN ties for the seed's largest peer group (docs/seed/headcount-quotas.md),
// so the peer-group reads are among the heaviest.
const jobTitle = 'Software Engineer II';
const country = 'IN';
const department = 'Engineering';

/**
 * The fixed request list (ADR 0006, *Measuring the 500 ms target*): the employee list four ways,
 * then each question endpoint, with and without filters where it takes any. Pay statistics and the
 * pay comparison require theirs, and payroll totals takes none, so each is timed once.
 */
export function perfRequests(rowCount: number): PerfRequest[] {
  const lastPage = Math.max(1, Math.ceil(rowCount / DEFAULT_PAGE_SIZE));
  return [
    FIRST_PAGE,
    get('Employees, last page', '/api/employees', { page: String(lastPage) }),
    get('Employees, filtered', '/api/employees', { country, department }),
    get('Employees, name search', '/api/employees', { q: 'mar' }),
    get('Pay statistics', '/api/pay-statistics', { jobTitle, country }),
    get('Payroll totals', '/api/payroll-totals'),
    get('Pay comparison', '/api/pay-comparison', { jobTitle }),
    get('Outliers, all', '/api/outliers'),
    get('Outliers, underpaid', '/api/outliers', { direction: 'below' }),
    get('Outliers, underpaid, filtered', '/api/outliers', {
      direction: 'below',
      country,
      department,
    }),
  ];
}
