import { problemSchema, type Problem } from '@acme/contract';

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

export interface ApiRequest {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  /** Sent as JSON. */
  body?: unknown;
}

/**
 * Sends a request to the API and returns its JSON body, typed by the caller (ADR 0004).
 * A non-2xx response throws an `ApiProblem`.
 */
export async function apiFetch<T>(path: string, request: ApiRequest = {}): Promise<T> {
  const headers: Record<string, string> = { Accept: 'application/json' };
  if (request.body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }
  const response = await fetch(path, {
    method: request.method ?? 'GET',
    headers,
    body: request.body === undefined ? undefined : JSON.stringify(request.body),
  });
  if (!response.ok) {
    throw new ApiProblem(await readProblem(response));
  }
  if (response.status === 204) {
    return undefined as T;
  }
  return (await response.json()) as T;
}

/**
 * The Problem Details of an error response. Anything else, such as an HTML 502 while the service
 * restarts, becomes a generic problem, never a JSON parse error (ADR 0004).
 */
async function readProblem(response: Response): Promise<Problem> {
  const text = await response.text();
  try {
    const parsed = problemSchema.safeParse(JSON.parse(text));
    if (parsed.success) {
      return parsed.data;
    }
  } catch {
    // Not JSON: fall through to the generic problem.
  }
  return {
    type: 'about:blank',
    title: 'Request failed',
    status: response.status,
    detail: `The server answered ${response.status} with a response the app cannot read.`,
  };
}
