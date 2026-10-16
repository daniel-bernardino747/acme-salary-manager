import { describe, expect, it } from 'vitest';
import { meetsTarget, summarizeTimings } from './timing-summary';

/** 1 to 100 in a scrambled order: the summary must not rely on the samples arriving sorted. */
const oneToHundred = Array.from({ length: 100 }, (_, i) => ((i * 37) % 100) + 1);

describe('summarizeTimings', () => {
  it('reports the cold request as is, and p50, p95 and max of the timed ones by nearest rank', () => {
    expect(summarizeTimings({ cold: 812.5, timed: oneToHundred })).toEqual({
      cold: 812.5,
      p50: 50,
      p95: 95,
      max: 100,
    });
  });
});

describe('meetsTarget', () => {
  const server = (p95: number) => ({ cold: 2000, p50: 10, p95, max: 3000 });

  // Only p95 counts: the cold request and the worst sample are reported, not judged (ADR 0006).
  it.each([
    [499.99, true],
    [500, false],
    [500.01, false],
  ])('judges a p95 server time of %d ms as %s', (p95, expected) => {
    expect(meetsTarget(server(p95))).toBe(expected);
  });
});
