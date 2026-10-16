import { describe, expect, it } from 'vitest';
import { average, median } from './statistics';

describe('median', () => {
  it('is the middle salary of an odd-sized set, in any order', () => {
    expect(median([7_000_000, 5_000_000, 6_000_000])).toBe(6_000_000);
  });

  it('is the mean of the two middle salaries of an even-sized set, rounded half up once', () => {
    // Sorted: 5,000,000 · 6,000,000 · 7,000,001 · 9,000,000 → (6,000,000 + 7,000,001) / 2 = 6,500,000.5.
    expect(median([7_000_001, 9_000_000, 5_000_000, 6_000_000])).toBe(6_500_001);
  });

  it('is the salary itself for a single-employee group', () => {
    expect(median([4_200_000])).toBe(4_200_000);
  });

  it('is null, never 0, for an empty set', () => {
    expect(median([])).toBeNull();
  });
});

describe('average', () => {
  it('rounds an exact half up', () => {
    // (100 + 101) / 2 = 100.5.
    expect(average([100, 101])).toBe(101);
  });

  it('rounds below half down', () => {
    // (100 + 100 + 101) / 3 = 100.33….
    expect(average([100, 100, 101])).toBe(100);
  });

  it('is the salary itself for a single-employee group', () => {
    expect(average([4_200_000])).toBe(4_200_000);
  });

  it('is null, never 0, for an empty set', () => {
    expect(average([])).toBeNull();
  });

  it('refuses a sum that is not a safe integer', () => {
    expect(() => average([Number.MAX_SAFE_INTEGER, 1])).toThrow(RangeError);
  });
});
