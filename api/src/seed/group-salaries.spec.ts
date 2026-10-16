import { describe, expect, it } from 'vitest';
import { median } from '../domain/statistics';
import { anchoredSalaries } from './group-salaries';
import { streamFor } from './prng';

// A $84,300 base in $100 steps: draws run from ceil(0.88 · 843) = 742 to floor(1.12 · 843) = 944 steps.
const baseMinor = 84_300_00;
const stepMinor = 100_00;
const lowest = 742 * stepMinor;
const highest = 944 * stepMinor;

describe('anchoredSalaries', () => {
  it.each([5, 6, 7, 10, 25, 341])(
    'gives a group of %i a median of exactly the base, with one or two on it and the rest in 0.88–1.12',
    (size) => {
      for (const stream of ['a', 'b', 'c', 'd', 'e']) {
        const salaries = anchoredSalaries(streamFor(stream), { baseMinor, stepMinor, size });

        expect(salaries).toHaveLength(size);
        expect(median(salaries)).toBe(baseMinor);
        expect(salaries.filter((s) => s === baseMinor)).toHaveLength(size % 2 === 1 ? 1 : 2);
        for (const salary of salaries) {
          expect(salary % stepMinor).toBe(0);
          expect(salary).toBeGreaterThanOrEqual(lowest);
          expect(salary).toBeLessThanOrEqual(highest);
        }
      }
    },
  );

  it('puts planted salaries in place of the lowest and highest draws, so the median does not move', () => {
    const group = { baseMinor, stepMinor, size: 7 };
    // 0.70, 0.80 and 1.30 × $84,300.
    const underpaid = [59_010_00, 67_440_00];
    const overpaid = [109_590_00];
    const ascending = (salaries: readonly number[]) => [...salaries].sort((a, b) => a - b);

    const drawn = ascending(anchoredSalaries(streamFor('a'), group));
    const planted = anchoredSalaries(streamFor('a'), { ...group, underpaid, overpaid });

    expect(ascending(planted)).toEqual(
      ascending([...underpaid, ...drawn.slice(2, -1), ...overpaid]),
    );
    expect(median(planted)).toBe(baseMinor);
  });
});
