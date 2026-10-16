import { employeeIdSchema, type EmployeeResponse } from '@acme/contract';
import { useQuery } from '@tanstack/react-query';
import { apiFetch, ApiProblem } from './api-fetch';
import { employeePath } from './employees-path';
import { queryKey } from './query-key';

/**
 * One employee, for the view and the edit page, by the `$id` in the URL. An id that is not a
 * positive integer is never sent to the API (ADR 0004, *Routing*): it is simply not found.
 */
export function useEmployee(idParam: string) {
  const id = employeeIdSchema.safeParse(idParam).data ?? null;
  const query = useQuery({
    queryKey: queryKey('employee', { id }),
    queryFn: () => apiFetch<EmployeeResponse>(employeePath(id ?? 0)),
    enabled: id !== null,
  });
  const notFound = id === null || (query.error instanceof ApiProblem && query.error.status === 404);
  return { id, query, notFound };
}
