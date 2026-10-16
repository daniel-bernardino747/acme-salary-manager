import { describe, expect, it } from 'vitest';
import {
  employeeFormSchema,
  salaryAfterCountryChange,
  salaryPreview,
  type EmployeeFormValues,
} from './employee-form';

const priya: EmployeeFormValues = {
  name: '  Priya Sharma ',
  jobTitle: 'Software Engineer II',
  department: 'Engineering',
  country: 'IN',
  annualSalary: '1,250,000.50',
};

/** Each field's messages, keyed by the field: what the form shows under it. */
function errorsOf(values: EmployeeFormValues): Record<string, string[]> {
  const result = employeeFormSchema.safeParse(values);
  const errors: Record<string, string[]> = {};
  for (const issue of result.error?.issues ?? []) {
    const field = String(issue.path[0]);
    (errors[field] ??= []).push(issue.message);
  }
  return errors;
}

describe('employeeFormSchema', () => {
  it('turns valid form values into the exact request body, the salary in minor units', () => {
    expect(employeeFormSchema.parse(priya)).toEqual({
      name: 'Priya Sharma',
      jobTitle: 'Software Engineer II',
      department: 'Engineering',
      country: 'IN',
      annualSalaryMinor: 1_250_000_50,
    });
  });

  it("holds the salary to the contract's bounds: above 0 and at most the cap", () => {
    expect(errorsOf({ ...priya, annualSalary: '0' })).toEqual({
      annualSalary: ['Must be greater than 0'],
    });
    expect(errorsOf({ ...priya, annualSalary: '0.00' })).toEqual({
      annualSalary: ['Must be greater than 0'],
    });
    expect(errorsOf({ ...priya, annualSalary: '9,000,000,000.00' })).toEqual({});
    expect(errorsOf({ ...priya, annualSalary: '9,000,000,000.01' })).toEqual({
      annualSalary: ['Exceeds the maximum salary'],
    });
  });

  it('asks for every field left empty, and for no salary until a country is picked', () => {
    const empty = { name: ' ', jobTitle: '', department: '', country: '', annualSalary: '' };
    expect(errorsOf(empty)).toEqual({
      name: ['Required'],
      jobTitle: ['Required'],
      department: ['Required'],
      country: ['Required'],
    });
    expect(errorsOf({ ...priya, annualSalary: '  ' })).toEqual({ annualSalary: ['Required'] });
  });

  it('reads a JPY salary as whole yen, and rejects any decimal', () => {
    const kenji = { ...priya, name: 'Kenji Watanabe', country: 'JP', annualSalary: '7,000,000' };
    expect(employeeFormSchema.parse(kenji)).toMatchObject({ annualSalaryMinor: 7_000_000 });
    expect(errorsOf({ ...kenji, annualSalary: '7,000,000.5' })).toEqual({
      annualSalary: ['JPY has no decimals'],
    });
  });

  it("rejects more decimals than the currency takes, and any format but the app's en one", () => {
    expect(errorsOf({ ...priya, country: 'US', annualSalary: '120,000.505' })).toEqual({
      annualSalary: ['USD takes at most 2 decimals'],
    });
    for (const annualSalary of ['1.250.000,50', '₹1,250,000', '-5', '12,50']) {
      expect(errorsOf({ ...priya, annualSalary })).toEqual({
        annualSalary: ['Use digits, comma thousands separators and a decimal point'],
      });
    }
  });

  it('checks the salary while another field is still invalid, so its message shows on blur', () => {
    expect(errorsOf({ ...priya, name: '', jobTitle: '', annualSalary: '0' })).toEqual({
      name: ['Required'],
      jobTitle: ['Required'],
      annualSalary: ['Must be greater than 0'],
    });
  });
});

describe('salaryPreview', () => {
  it.each([
    ['1,250,000.50', 'IN', '= ₹1,250,000.50 a year'],
    ['1250000.5', 'IN', '= ₹1,250,000.50 a year'],
    ['7000000', 'JP', '= ¥7,000,000 a year'],
    ['64,000', 'NL', '= €64,000.00 a year'],
  ])('shows %s in %s as %s', (annualSalary, country, preview) => {
    expect(salaryPreview(annualSalary, country)).toBe(preview);
  });

  it.each([
    ['nothing typed', '', 'IN'],
    ['no country', '120,000', ''],
    ['a salary that does not read', '1.250.000,50', 'IN'],
    ['a salary out of bounds', '0', 'US'],
  ])('shows nothing for %s', (_, annualSalary, country) => {
    expect(salaryPreview(annualSalary, country)).toBeNull();
  });
});

describe('salaryAfterCountryChange', () => {
  it('clears a salary typed in another currency, saying which currency to enter it in', () => {
    expect(salaryAfterCountryChange('US', 'JP', '120,000')).toEqual({
      annualSalary: '',
      message: 'Salary was in USD; enter it in JPY.',
    });
  });

  it('keeps the salary between two countries with the same currency', () => {
    expect(salaryAfterCountryChange('DE', 'NL', '64,000')).toEqual({
      annualSalary: '64,000',
      message: null,
    });
  });

  it('has nothing to clear when no salary is typed, or no country was picked before', () => {
    expect(salaryAfterCountryChange('US', 'JP', '')).toEqual({ annualSalary: '', message: null });
    expect(salaryAfterCountryChange('', 'JP', '')).toEqual({ annualSalary: '', message: null });
  });
});
