import { describe, expect, it } from 'vitest';
import { employeesPath } from './employees-path';

describe('employeesPath', () => {
  it('asks for the page at the fixed page size of 25', () => {
    expect(employeesPath({ page: 3 })).toBe('/api/employees?page=3&pageSize=25');
  });

  it('passes the search and every filter set', () => {
    expect(
      employeesPath({
        page: 1,
        q: "o'connor",
        country: 'GB',
        department: 'Customer Support',
        jobTitle: 'Support Team Lead',
      }),
    ).toBe(
      '/api/employees?page=1&pageSize=25&q=o%27connor&country=GB&department=Customer+Support&jobTitle=Support+Team+Lead',
    );
  });

  it('passes the annual salary range as minor units', () => {
    expect(
      employeesPath({
        page: 1,
        country: 'DE',
        minSalaryMinor: 5_000_000,
        maxSalaryMinor: 8_000_000,
      }),
    ).toBe(
      '/api/employees?page=1&pageSize=25&country=DE&minSalaryMinor=5000000&maxSalaryMinor=8000000',
    );
  });

  it('leaves out a blank search', () => {
    expect(employeesPath({ page: 1, q: '  ' })).toBe('/api/employees?page=1&pageSize=25');
  });
});
