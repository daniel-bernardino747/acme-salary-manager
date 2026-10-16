import { afterEach, describe, expect, it, vi } from 'vitest';
import { ApiProblem, apiFetch } from './api-fetch';

/** Answers every request with `response`, as the network would, and records the requests. */
function serve(response: Response) {
  const fetch = vi.fn(async (_input: RequestInfo | URL, _init?: RequestInit) => response);
  vi.stubGlobal('fetch', fetch);
  return fetch;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('apiFetch', () => {
  it('returns the JSON body of a successful response', async () => {
    serve(Response.json({ status: 'ok' }));

    await expect(apiFetch<{ status: string }>('/api/health')).resolves.toEqual({ status: 'ok' });
  });

  it('sends a body as JSON', async () => {
    const fetch = serve(Response.json({ id: 7 }, { status: 201 }));

    await apiFetch('/api/employees', { method: 'POST', body: { name: 'Priya Sharma' } });

    const [path, init] = fetch.mock.calls[0]!;
    expect(path).toBe('/api/employees');
    expect(init?.method).toBe('POST');
    expect(new Headers(init?.headers).get('Content-Type')).toBe('application/json');
    expect(init?.body).toBe('{"name":"Priya Sharma"}');
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

  it('turns an error response that is not Problem Details into a generic ApiProblem', async () => {
    serve(
      new Response('<html><body>502 Bad Gateway</body></html>', {
        status: 502,
        headers: { 'Content-Type': 'text/html' },
      }),
    );

    const error = await apiFetch('/api/payroll-totals').catch((e: unknown) => e);

    expect(error).toBeInstanceOf(ApiProblem);
    expect((error as ApiProblem).problem).toEqual({
      type: 'about:blank',
      title: 'Request failed',
      status: 502,
      detail: 'The server answered 502 with a response the app cannot read.',
    });
  });
});
