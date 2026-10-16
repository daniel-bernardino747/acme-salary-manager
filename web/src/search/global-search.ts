import { countries, jobTitles, type JobTitle } from '@acme/contract';

/** Shorter queries match too many names to be useful (ADR 0004, *Global search*). */
const MIN_EMPLOYEE_QUERY = 2;

/** How many employees the overlay lists; "See all" opens the rest in the list. */
export const EMPLOYEE_RESULTS = 8;

/** How many job titles the overlay lists. */
const JOB_TITLE_RESULTS = 4;

export function isEmployeeQuery(query: string): boolean {
  return query.trim().length >= MIN_EMPLOYEE_QUERY;
}

/** The list's own endpoint and search rule, at the overlay's page size (ADR 0004, *Global search*). */
export function employeeSearchPath(query: string): string {
  const params = new URLSearchParams({
    page: '1',
    pageSize: String(EMPLOYEE_RESULTS),
    q: query.trim(),
  });
  return `/api/employees?${params}`;
}

/** Whether `text` contains the query, ignoring case and surrounding spaces. */
export const matches = (text: string, query: string) =>
  text.toLocaleLowerCase('en').includes(query.trim().toLocaleLowerCase('en'));

/** Job titles containing the query, in the reference order, from the contract with no request. */
export function matchingJobTitles(query: string): JobTitle[] {
  if (!query.trim()) {
    return [];
  }
  return jobTitles.filter((title) => matches(title, query)).slice(0, JOB_TITLE_RESULTS);
}

/** Countries whose name or code contains the query, from the contract with no request. */
export function matchingCountries(query: string) {
  if (!query.trim()) {
    return [];
  }
  return countries.filter(({ code, name }) => matches(name, query) || matches(code, query));
}
