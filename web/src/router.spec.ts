import { createMemoryHistory } from '@tanstack/react-router';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import { createAppRouter } from './router';

/** Loads `url` with no DOM: a memory history, and only the `window.origin` the router reads. */
async function load(url: string) {
  const router = createAppRouter(createMemoryHistory({ initialEntries: [url] }));
  await router.load();
  return router.state;
}

const leafRoute = (state: Awaited<ReturnType<typeof load>>) => state.matches.at(-1)?.routeId;

describe('routes (ADR 0004, Routing)', () => {
  beforeAll(() => {
    vi.stubGlobal('window', { origin: 'http://localhost' });
    return () => vi.unstubAllGlobals();
  });

  it('opens on the payroll', async () => {
    const state = await load('/');

    expect(state.location.pathname).toBe('/pay/payroll');
    expect(leafRoute(state)).toBe('/pay/payroll');
  });

  it.each([
    ['/employees', '/employees'],
    ['/employees/new', '/employees/new'],
    ['/employees/7', '/employees/$id'],
    ['/employees/7/edit', '/employees/$id/edit'],
    ['/pay/statistics', '/pay/statistics'],
    ['/pay/payroll', '/pay/payroll'],
    ['/pay/comparison', '/pay/comparison'],
    ['/pay/outliers', '/pay/outliers'],
  ])('matches %s to its screen', async (url, routeId) => {
    expect(leafRoute(await load(url))).toBe(routeId);
  });

  it('matches no screen for an unknown path, so the not-found screen shows', async () => {
    const state = await load('/pay/nowhere');

    expect(state.matches.map((match) => match.routeId)).toEqual(['__root__']);
  });

  it('hands a screen its search params read as text, then validated', async () => {
    const state = await load('/employees?q=123&page=2&country=XX');

    expect(state.matches.at(-1)?.search).toEqual({ page: 2, q: '123' });
  });
});
