import { describe, expect, it } from 'vitest';
import { activeNavItem, navItems, pageQuestion } from './navigation';

describe('navigation (ADR 0004, Routing, as amended by #40)', () => {
  it('lists Overview and Employees, then the Pay group in research order, with short labels', () => {
    expect(navItems.map(({ group, label, to }) => [group, label, to])).toEqual([
      ['main', 'Overview', '/'],
      ['main', 'Employees', '/employees'],
      ['pay', 'Pay by role', '/pay/statistics'],
      ['pay', 'Outliers', '/pay/outliers'],
      ['pay', 'Payroll', '/pay/payroll'],
      ['pay', 'Across countries', '/pay/comparison'],
    ]);
  });

  it.each([
    ['/', '/'],
    ['/employees', '/employees'],
    ['/employees/new', '/employees'],
    ['/employees/7', '/employees'],
    ['/employees/7/edit', '/employees'],
    ['/pay/statistics', '/pay/statistics'],
    ['/pay/outliers', '/pay/outliers'],
    ['/pay/payroll', '/pay/payroll'],
    ['/pay/comparison', '/pay/comparison'],
  ])('marks %s as within %s', (pathname, item) => {
    expect(activeNavItem(pathname)).toBe(item);
  });

  it('marks nothing on an unknown path, so the not-found page claims no item', () => {
    expect(activeNavItem('/nope')).toBeNull();
    expect(activeNavItem('/pay')).toBeNull();
    expect(activeNavItem('/employeesx')).toBeNull();
  });

  it.each([
    ['/pay/statistics', 'What do we pay for a job title in a country?'],
    ['/pay/outliers', 'Who is paid out of line with their peers?'],
    ['/pay/payroll', 'What is our payroll total, by country and department?'],
    ['/pay/comparison', 'How does pay for a job title compare across countries?'],
  ] as const)('keeps the question %s answers as its subtitle', (to, question) => {
    expect(pageQuestion(to)).toBe(question);
  });
});
