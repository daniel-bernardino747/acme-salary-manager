import type { EmployeeResponse } from '@acme/contract';
import { describe, expect, it } from 'vitest';
import { findOutliers, type PeerGroupMember } from './outliers';

let nextId = 1;

/** A member of a peer group the filters touch, shown unless said otherwise. */
function member(
  annualSalaryMinor: number,
  overrides: Partial<Omit<EmployeeResponse, 'annualSalary'>> = {},
  shown = true,
): PeerGroupMember {
  const employee = {
    id: nextId++,
    name: `Employee ${nextId}`,
    jobTitle: 'Software Engineer II',
    department: 'Engineering',
    country: 'US',
    ...overrides,
  } as const;
  const currency = employee.country === 'US' ? 'USD' : 'INR';
  return {
    employee: { ...employee, annualSalary: { amountMinor: annualSalaryMinor, currency } },
    shown,
  };
}

const usd = (amountMinor: number) => ({ amountMinor, currency: 'USD' as const });

describe('findOutliers', () => {
  it('flags an employee strictly below 0.80 of their peer median as underpaid, with the median, headcount and compa-ratio', () => {
    // Sorted: 7,996 · 9,000 · 10,000 · 11,000 · 11,500, so the median is $10,000.00.
    // 7,996 / 10,000 = 0.7996 is below 0.80 and shows as 0.79. Everyone else is inside 0.80–1.20.
    const underpaid = member(7_996_00);
    const group = [
      member(10_000_00),
      underpaid,
      member(11_500_00),
      member(9_000_00),
      member(11_000_00),
    ];

    const { outliers } = findOutliers(group);

    expect(outliers).toHaveLength(1);
    expect(outliers[0]).toMatchObject({
      employee: underpaid.employee,
      peerMedian: usd(10_000_00),
      peerHeadcount: 5,
      compaRatioHundredths: 79,
      direction: 'below',
    });
  });
});
