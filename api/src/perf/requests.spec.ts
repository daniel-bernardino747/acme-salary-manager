import { describe, expect, it } from 'vitest';
import { FIRST_PAGE, perfRequests } from './requests';

describe('perfRequests', () => {
  it('lists the employee list four ways and every question endpoint with and without filters', () => {
    expect(perfRequests(10_000)).toEqual([
      FIRST_PAGE,
      { label: 'Employees, last page', path: '/api/employees?page=400' },
      {
        label: 'Employees, filtered',
        path: '/api/employees?country=IN&department=Engineering',
      },
      { label: 'Employees, name search', path: '/api/employees?q=mar' },
      {
        label: 'Pay statistics',
        path: '/api/pay-statistics?jobTitle=Software+Engineer+II&country=IN',
      },
      { label: 'Payroll totals', path: '/api/payroll-totals' },
      { label: 'Pay comparison', path: '/api/pay-comparison?jobTitle=Software+Engineer+II' },
      { label: 'Outliers, all', path: '/api/outliers' },
      { label: 'Outliers, underpaid', path: '/api/outliers?direction=below' },
      {
        label: 'Outliers, underpaid, filtered',
        path: '/api/outliers?direction=below&country=IN&department=Engineering',
      },
    ]);
    expect(FIRST_PAGE).toEqual({ label: 'Employees, first page', path: '/api/employees' });
  });

  it.each([
    [10_001, '/api/employees?page=401'],
    [25, '/api/employees?page=1'],
    [0, '/api/employees?page=1'],
  ])('with %i employees, asks for the last page as %s', (rowCount, lastPage) => {
    expect(perfRequests(rowCount)[1]?.path).toBe(lastPage);
  });
});
