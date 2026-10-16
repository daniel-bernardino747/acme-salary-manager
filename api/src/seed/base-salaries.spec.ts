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

  it.each([
    // $130,000 · 0.65¹ = $84,500, already a whole step.
    ['Sales Development Representative', 'US', 84_500_00],
    // ₹1,800,000 · 1.65^1.35 = ₹1,800,000 · 1.96609 ≈ ₹3,538,961, to the step: ₹3,539,000.
    ['Staff Software Engineer', 'IN', 3_539_000_00],
    // R$156,000 · 1.40^1.25 = R$156,000 · 1.52282 ≈ R$237,560, to the step: R$237,600.
    ['Senior Data Scientist', 'BR', 237_600_00],
    // ¥7,000,000 · 0.55^1.15 = ¥7,000,000 · 0.50283 ≈ ¥3,519,777, to the ¥10,000 step: ¥3,520,000.
    ['Customer Support Specialist', 'JP', 3_520_000],
  ] as const)('is anchor · multiplier ^ spread, to the nearest step, for %s · %s', (title, country, base) => {
    expect(baseSalaryMinor(title, country)).toBe(base);
  });
});
