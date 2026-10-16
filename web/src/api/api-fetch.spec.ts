import { afterEach, describe, expect, it, vi } from 'vitest';
import { apiFetch } from './api-fetch';

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
});
