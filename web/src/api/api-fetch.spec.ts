import { afterEach, describe, expect, it, vi } from 'vitest';
import { ApiProblem, apiFetch } from './api-fetch';

/** Answers every request with `response`, as the network would. */
function serve(response: Response): void {
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => response),
  );
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('apiFetch', () => {
  it('returns the JSON body of a successful response', async () => {
    serve(Response.json({ status: 'ok' }));

    await expect(apiFetch<{ status: string }>('/api/health')).resolves.toEqual({ status: 'ok' });
  });

  it('does not parse a 204, which has no body', async () => {
    serve(new Response(null, { status: 204 }));

    await expect(apiFetch<void>('/api/employees/7', { method: 'DELETE' })).resolves.toBeUndefined();
  });

  it('throws an ApiProblem carrying the Problem Details body of an error response', async () => {
    const problem = {
      type: 'about:blank',
      title: 'Validation failed',
      status: 400,
      detail: 'Request body is invalid',
      errors: [{ path: ['annualSalaryMinor'], message: 'Must be greater than 0' }],
    };
    serve(
      Response.json(problem, {
        status: 400,
        headers: { 'Content-Type': 'application/problem+json' },
      }),
    );

    const error = await apiFetch('/api/employees', { method: 'POST' }).catch((e: unknown) => e);

    expect(error).toBeInstanceOf(ApiProblem);
    expect((error as ApiProblem).problem).toEqual(problem);
  });
});
