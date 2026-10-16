import { describe, expect, it } from 'vitest';
import { intInRange, sfc32 } from './prng';

const take = (next: () => number, n: number) => Array.from({ length: n }, next);

describe('sfc32', () => {
  it('gives the same unsigned 32-bit integers for the same seed, and others for another seed', () => {
    const first = take(sfc32([1, 2, 3, 4]), 1000);

    expect(take(sfc32([1, 2, 3, 4]), 1000)).toEqual(first);
    expect(take(sfc32([1, 2, 3, 5]), 1000)).not.toEqual(first);
    expect(first.every((n) => Number.isInteger(n) && n >= 0 && n <= 0xffff_ffff)).toBe(true);
    expect(new Set(first).size).toBe(1000);
  });
});

describe('intInRange', () => {
  it('draws whole numbers from min to max, both included', () => {
    const next = sfc32([1, 2, 3, 4]);

    const draws = take(() => intInRange(next, 88, 112), 2000);

    expect(new Set(draws)).toEqual(new Set(Array.from({ length: 25 }, (_, i) => 88 + i)));
  });

  it('rejects a draw past the last whole multiple of the range size, so there is no modulo bias', () => {
    // 2³² = 3 · 1,431,655,765 + 1, so only 0xFFFFFFFF falls past the last whole multiple of 3.
    const script = [0xffff_ffff, 0xffff_fffe];
    const next = () => script.shift() ?? Number.NaN;

    expect(intInRange(next, 10, 12)).toBe(10 + (0xffff_fffe % 3));
    expect(script).toEqual([]);
  });
});
