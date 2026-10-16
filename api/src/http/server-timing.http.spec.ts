import { describe, expect, it } from 'vitest';
import { useTestApp } from '../../test/http';

/** `app;dur=<ms>`, the duration a non-negative decimal (ADR 0006, *Measuring the 500 ms target*). */
const serverTimingShape = /^app;dur=\d+(\.\d+)?$/;

describe('Server-Timing', () => {
  const t = useTestApp();

  // The value is wall-clock time, so only its presence and shape are pinned (ADR 0006, *Determinism*).
  it.each([
    ['a success', '/api/health', 200],
    ['a validation problem', '/api/employees?contry=IN', 400],
    ['an unknown /api route', '/api/no-such-route', 404],
  ])('times %s', async (_name, path, status) => {
    const res = await t.http().get(path).expect(status);

    expect(res.headers['server-timing']).toMatch(serverTimingShape);
  });
});
