import type { Problem } from '@acme/contract';

/** An error response from the API, carrying its Problem Details body (ADR 0003). */
export class ApiProblem extends Error {
  constructor(readonly problem: Problem) {
    super(problem.detail ?? problem.title);
    this.name = 'ApiProblem';
  }

  get status(): number {
    return this.problem.status;
  }
}

/**
 * Sends a request to the API and returns its JSON body, typed by the caller (ADR 0004).
 * A non-2xx response throws an `ApiProblem`.
 */
export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(path, { ...init, headers: { Accept: 'application/json' } });
  if (!response.ok) {
    throw new ApiProblem((await response.json()) as Problem);
  }
  if (response.status === 204) {
    return undefined as T;
  }
  return (await response.json()) as T;
}
