import { describe, expect, it } from 'vitest';
import { employeeFormSchema, type EmployeeFormValues } from './employee-form';

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
