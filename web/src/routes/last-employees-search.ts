import type { EmployeesSearch } from './search';

let last: EmployeesSearch = { page: 1 };

/**
 * The list's search as the HR Manager last saw it, so a delete from the employee view returns to
 * that page of the list (ADR 0004, *Data fetching*). It lives for the tab, never in storage.
 */
export const lastEmployeesSearch = {
  get: (): EmployeesSearch => last,
  set: (search: EmployeesSearch): void => {
    last = search;
  },
};
