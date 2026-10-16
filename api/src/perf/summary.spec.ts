import { describe, expect, it } from 'vitest';
import { summarize } from './summary';

/** 1 to 100 in a scrambled order: the summary must not rely on the samples arriving sorted. */
const oneToHundred = Array.from({ length: 100 }, (_, i) => ((i * 37) % 100) + 1);

describe('summarize', () => {
  it('reports the cold request as is, and p50, p95 and max of the timed ones by nearest rank', () => {
    expect(summarize({ cold: 812.5, timed: oneToHundred })).toEqual({
      cold: 812.5,
      p50: 50,
      p95: 95,
      max: 100,
    });
  });
});
