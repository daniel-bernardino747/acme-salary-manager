import { countries, jobTitles } from '@acme/contract';
import { describe, expect, it } from 'vitest';
import { baseSalaryMinor, salaryStepMinor } from './base-salaries';

describe('baseSalaryMinor', () => {
  it('is the anchor for a Software Engineer II, and a whole number of salary steps everywhere', () => {
    expect(countries.map((c) => baseSalaryMinor('Software Engineer II', c.code))).toEqual([
      130_000_00, 62_000_00, 68_000_00, 64_000_00, 1_800_000_00, 156_000_00, 7_000_000,
    ]);
    for (const { code } of countries) {
      for (const title of jobTitles) {
        const base = baseSalaryMinor(title, code);
        expect(base).toBeGreaterThan(0);
        expect(base % salaryStepMinor(code)).toBe(0);
      }
    }
  });
});
