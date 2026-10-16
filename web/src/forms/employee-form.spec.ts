import { describe, expect, it } from 'vitest';
import { employeeFormSchema, type EmployeeFormValues } from './employee-form';

const priya: EmployeeFormValues = {
  name: '  Priya Sharma ',
  jobTitle: 'Software Engineer II',
  department: 'Engineering',
  country: 'IN',
  annualSalary: '1,250,000.50',
};

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
});
