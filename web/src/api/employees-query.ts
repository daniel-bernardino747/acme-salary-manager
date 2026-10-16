import type { EmployeeListResponse } from '@acme/contract';
import { queryOptions } from '@tanstack/react-query';
import type { EmployeesSearch } from '../routes/search';
import { apiFetch } from './api-fetch';
import { employeesPath } from './employees-path';
import { queryKey } from './query-key';

/** One page of the list, for the list screen and for the delete flow's step back. */
export function employeesQuery(search: EmployeesSearch) {
  return queryOptions({
    queryKey: queryKey('employees', search),
    queryFn: () => apiFetch<EmployeeListResponse>(employeesPath(search)),
  });
}
