import { describe, expect, it } from 'vitest';
import { ApiProblem } from './api-fetch';
import { createQueryClient } from './query-client';

function problem(status: number): ApiProblem {
  return new ApiProblem({ type: 'about:blank', title: 'Error', status });
}

describe('createQueryClient', () => {
  const { retry } = createQueryClient().getDefaultOptions().queries ?? {};
  const shouldRetry = retry as (failureCount: number, error: unknown) => boolean;

  it('never retries a 4xx problem', () => {
    expect(shouldRetry(0, problem(400))).toBe(false);
    expect(shouldRetry(0, problem(404))).toBe(false);
  });

  it('retries a 5xx problem or a network failure up to three times', () => {
    expect(shouldRetry(0, problem(502))).toBe(true);
    expect(shouldRetry(2, new TypeError('Failed to fetch'))).toBe(true);
    expect(shouldRetry(3, problem(500))).toBe(false);
  });
});
