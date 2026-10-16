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

  it('flags an employee strictly above 1.20 as overpaid, and neither exactly 0.80 nor exactly 1.20', () => {
    // Sorted: 8,000 · 10,000 · 10,000 · 12,000 · 12,004, so the median is $10,000.00.
    // 0.80 and 1.20 sit on the boundaries; 12,004 / 10,000 = 1.2004 is above and shows as 1.21.
    const overpaid = member(12_004_00);
    const group = [
      member(8_000_00),
      member(10_000_00),
      overpaid,
      member(12_000_00),
      member(10_000_00),
    ];

    const { outliers } = findOutliers(group);

    expect(outliers).toHaveLength(1);
    expect(outliers[0]).toMatchObject({
      employee: overpaid.employee,
      peerMedian: usd(10_000_00),
      peerHeadcount: 5,
      compaRatioHundredths: 121,
      direction: 'above',
    });
  });

  it('checks a peer group of exactly 5 and never a group of 4', () => {
    // Both groups have the same salaries but one, and the same median: ₹20,00,000.00 for the 4
    // (the mean of the two middle ones) and for the 5. ₹10,00,000.00 is 0.50 of it in both.
    const small = { jobTitle: 'Data Analyst', country: 'IN' } as const;
    const checked = { jobTitle: 'Data Scientist', country: 'IN' } as const;
    const underpaid = member(1_000_000_00, checked);
    const group = [
      member(1_000_000_00, small),
      member(2_000_000_00, small),
      member(2_000_000_00, small),
      member(2_100_000_00, small),
      underpaid,
      member(2_000_000_00, checked),
      member(2_000_000_00, checked),
      member(2_000_000_00, checked),
      member(2_100_000_00, checked),
    ];

    const { outliers } = findOutliers(group);

    expect(outliers.map((o) => o.employee)).toEqual([underpaid.employee]);
    expect(outliers[0]?.peerHeadcount).toBe(5);
  });

  it('counts the shown employees in small groups, who were not checked', () => {
    const pair = { jobTitle: 'Accountant', country: 'US' } as const;
    const single = { jobTitle: 'Recruiter', country: 'US' } as const;
    const group = [
      // A group of 2 with one member shown, and a group of 1: 2 shown employees left unchecked.
      member(60_000_00, pair),
      member(70_000_00, { ...pair, department: 'People' }, false),
      member(50_000_00, single),
      // A checked group of 5 adds nothing.
      ...[1, 2, 3, 4, 5].map((n) => member(n * 10_000_00)),
    ];

    expect(findOutliers(group).smallGroupHeadcount).toBe(2);
  });

  it('takes the median over the whole peer group, but lists only the members who are shown', () => {
    // Sorted: 6,000 · 7,000 · 10,000 · 12,000 · 12,000, so the whole group's median is $10,000.00.
    // The shown three alone (7,000 · 12,000 · 12,000) would give $12,000.00. The hidden 6,000 is
    // below 0.80 too, but is never listed.
    const shownUnderpaid = member(7_000_00);
    const group = [
      shownUnderpaid,
      member(6_000_00, { department: 'Sales' }, false),
      member(12_000_00),
      member(10_000_00, { department: 'Sales' }, false),
      member(12_000_00),
    ];

    const { outliers } = findOutliers(group);

    expect(outliers.map((o) => o.employee)).toEqual([shownUnderpaid.employee]);
    expect(outliers[0]).toMatchObject({ peerMedian: usd(10_000_00), peerHeadcount: 5 });
  });
});
