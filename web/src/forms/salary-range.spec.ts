import { describe, expect, it } from 'vitest';
import { commitSalaryBound, salaryBoundText } from './salary-range';

const germany = { country: 'DE' } as const;
const ranged = { country: 'DE', minSalaryMinor: 50_000_00, maxSalaryMinor: 80_000_00 } as const;

describe('commitSalaryBound', () => {
  it("reads the typed text in the country's currency as minor units", () => {
    expect(commitSalaryBound('min', ' 50,000.50 ', germany)).toEqual({
      success: true,
      change: { minSalaryMinor: 50_000_50 },
    });
    expect(commitSalaryBound('max', '6000000', { country: 'JP' })).toEqual({
      success: true,
      change: { maxSalaryMinor: 6_000_000 },
    });
  });

  it('clears the bound when the field is left empty', () => {
    expect(commitSalaryBound('max', '  ', ranged)).toEqual({
      success: true,
      change: { maxSalaryMinor: null },
    });
  });

  it('takes a minimum equal to the maximum, since both bounds are inclusive', () => {
    expect(commitSalaryBound('min', '80,000', ranged)).toEqual({
      success: true,
      change: { minSalaryMinor: 80_000_00 },
    });
    expect(commitSalaryBound('max', '50,000', ranged)).toEqual({
      success: true,
      change: { maxSalaryMinor: 50_000_00 },
    });
  });

  it('rejects a minimum above the maximum, from either field', () => {
    const error = { success: false, error: 'The minimum must not exceed the maximum' };
    expect(commitSalaryBound('min', '80,000.01', ranged)).toEqual(error);
    expect(commitSalaryBound('max', '49,999.99', ranged)).toEqual(error);
  });

  it("rejects what the currency or the salary's own bounds don't allow", () => {
    expect(commitSalaryBound('min', '50000.5', { country: 'JP' })).toEqual({
      success: false,
      error: 'JPY has no decimals',
    });
    expect(commitSalaryBound('min', '0', germany)).toEqual({
      success: false,
      error: 'Must be greater than 0',
    });
    expect(commitSalaryBound('max', '9,000,000,000.01', germany)).toEqual({
      success: false,
      error: 'Exceeds the maximum salary',
    });
    expect(commitSalaryBound('max', '50k', germany)).toMatchObject({ success: false });
  });
});

describe('salaryBoundText', () => {
  it("shows a committed bound as plain input in the country's currency, and no bound as empty", () => {
    expect(salaryBoundText(50_000_50, 'DE')).toBe('50000.50');
    expect(salaryBoundText(6_000_000, 'JP')).toBe('6000000');
    expect(salaryBoundText(undefined, 'DE')).toBe('');
  });
});
