import { describe, expect, it } from 'vitest';
import { employeeRequestSchema } from './index.js';

const body = {
  name: 'Priya Sharma',
  jobTitle: 'Software Engineer II',
  department: 'Engineering',
  country: 'IN',
  annualSalaryMinor: 2_400_000_00,
};

function messages(input: unknown): string[] {
  const result = employeeRequestSchema.safeParse(input);
  return result.success ? [] : result.error.issues.map((issue) => issue.message);
}

describe('employeeRequestSchema', () => {
  it('accepts a valid body and trims the name', () => {
    expect(employeeRequestSchema.parse({ ...body, name: '  Priya Sharma ' })).toEqual(body);
  });

  it('rejects a currency field, since the currency follows from the country', () => {
    expect(employeeRequestSchema.safeParse({ ...body, currency: 'INR' }).success).toBe(false);
  });

  it('takes a name of 1 to 100 characters after trimming', () => {
    expect(employeeRequestSchema.safeParse({ ...body, name: 'x'.repeat(100) }).success).toBe(true);
    expect(employeeRequestSchema.safeParse({ ...body, name: 'x'.repeat(101) }).success).toBe(false);
    expect(employeeRequestSchema.safeParse({ ...body, name: '   ' }).success).toBe(false);
  });

  it('takes a whole salary greater than 0 and at most 900,000,000,000 minor units', () => {
    expect(messages({ ...body, annualSalaryMinor: 0 })).toEqual(['Must be greater than 0']);
    expect(messages({ ...body, annualSalaryMinor: -100 })).toEqual(['Must be greater than 0']);
    expect(messages({ ...body, annualSalaryMinor: 900_000_000_000 })).toEqual([]);
    expect(messages({ ...body, annualSalaryMinor: 900_000_000_001 })).toHaveLength(1);
    expect(messages({ ...body, annualSalaryMinor: 1_000.5 })).toHaveLength(1);
  });

  it('takes only values from the reference lists', () => {
    expect(employeeRequestSchema.safeParse({ ...body, country: 'UK' }).success).toBe(false);
    expect(employeeRequestSchema.safeParse({ ...body, department: 'Legal' }).success).toBe(false);
    expect(employeeRequestSchema.safeParse({ ...body, jobTitle: 'CEO' }).success).toBe(false);
  });
});
