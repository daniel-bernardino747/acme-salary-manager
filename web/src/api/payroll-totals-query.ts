import type { PayrollTotalsResponse } from '@acme/contract';
import { queryOptions } from '@tanstack/react-query';
import { apiFetch } from './api-fetch';
import { queryKey } from './query-key';

/** Question 2's response, for its screen and the Overview, under one cached key. */
export function payrollTotalsQuery() {
  return queryOptions({
    queryKey: queryKey('payroll-totals'),
    queryFn: () => apiFetch<PayrollTotalsResponse>('/api/payroll-totals'),
  });
}
