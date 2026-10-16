import { describe, expect, it } from 'vitest';
import { payStatistics } from './pay-statistics';

const inr = (amountMinor: number) => ({ amountMinor, currency: 'INR' });

describe('payStatistics', () => {
  it('gives the headcount, min, median, average and max of an even-sized group, in its currency', () => {
    // Sorted: 5,000,000 · 5,500,000 · 6,000,000 · 7,000,001 · 8,000,000 · 9,000,000.
    // Median (6,000,000 + 7,000,001) / 2 = 6,500,000.5 → 6,500,001.
    // Average 40,500,001 / 6 = 6,750,000.16… → 6,750,000.
    const group = {
      currency: 'INR' as const,
      salariesMinor: [9_000_000, 5_000_000, 7_000_001, 6_000_000, 8_000_000, 5_500_000],
    };

    expect(payStatistics(group)).toEqual({
      headcount: 6,
      smallGroup: false,
      min: inr(5_000_000),
      median: inr(6_500_001),
      average: inr(6_750_000),
      max: inr(9_000_000),
    });
  });

  it('marks a single-employee group as small, every figure being their salary', () => {
    expect(payStatistics({ currency: 'INR', salariesMinor: [4_200_000] })).toEqual({
      headcount: 1,
      smallGroup: true,
      min: inr(4_200_000),
      median: inr(4_200_000),
      average: inr(4_200_000),
      max: inr(4_200_000),
    });
  });

  it.each([
    [4, true],
    [5, false],
  ])('marks a group of %i as small: %s', (headcount, smallGroup) => {
    const salariesMinor = Array.from({ length: headcount }, (_, i) => 100 * (i + 1));
    expect(payStatistics({ currency: 'INR', salariesMinor })).toMatchObject({
      headcount,
      smallGroup,
    });
  });

  it('gives an empty group headcount 0 and null figures, never 0, and does not mark it small', () => {
    expect(payStatistics({ currency: 'INR', salariesMinor: [] })).toEqual({
      headcount: 0,
      smallGroup: false,
      min: null,
      median: null,
      average: null,
      max: null,
    });
  });
});
