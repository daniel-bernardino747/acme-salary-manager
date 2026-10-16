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

describe('findOutliers ranking', () => {
  it('ranks the most extreme first, by distance from 1.00, across peer groups and directions', () => {
    // US median $10,000.00: 1.40 is 0.40 away, 0.75 is 0.25, 0.795 is 0.205 and 0.7996 is 0.2004.
    // IN median ₹20,00,000.00: 0.65 is 0.35 away. 0.795 and 0.7996 both show as 0.79, so only the
    // exact distance tells them apart.
    const us = (salary: number) => member(salary, { jobTitle: 'Product Manager', country: 'US' });
    const india = (salary: number) => member(salary, { jobTitle: 'Accountant', country: 'IN' });
    const at140 = us(14_000_00);
    const at075 = us(7_500_00);
    const at0795 = us(7_950_00);
    const at07996 = us(7_996_00);
    const at065 = india(1_300_000_00);
    const group = [
      at07996,
      at075,
      us(10_000_00),
      at140,
      us(10_000_00),
      us(10_000_00),
      at0795,
      at065,
      ...[1, 2, 3, 4].map(() => india(2_000_000_00)),
    ];

    const { outliers } = findOutliers(group);

    expect(outliers.map((o) => o.employee)).toEqual(
      [at140, at065, at075, at0795, at07996].map((m) => m.employee),
    );
  });

  it('compares distances exactly when the cross-multiplied products pass 2⁵³', () => {
    // m = 400,000,000,000 and m + 1 as medians, each with one salary of 1 minor unit.
    // The distances are m / (m + 1) and (m − 1) / m. Cross-multiplied: m² against m² − 1, about
    // 1.6 × 10²³, where neighbouring doubles are 2²⁵ apart, so only BigInt sees the first is larger.
    const m = 400_000_000_000;
    const nearer = { jobTitle: 'Accountant', country: 'US', name: 'Amy Adams' } as const;
    const farther = { jobTitle: 'Recruiter', country: 'US', name: 'Zed Young' } as const;
    const fartherOutlier = member(1, farther);
    const nearerOutlier = member(1, nearer);
    const group = [
      nearerOutlier,
      ...[1, 2, 3, 4].map(() => member(m, nearer)),
      fartherOutlier,
      ...[1, 2, 3, 4].map(() => member(m + 1, farther)),
    ];

    const { outliers } = findOutliers(group);

    expect(outliers.map((o) => o.employee)).toEqual([
      fartherOutlier.employee,
      nearerOutlier.employee,
    ]);
  });

  it('orders equal distances by name, then id, as the list orders employees', () => {
    // Median $10,000.00 (the mean of two middle 10,000s): 0.70 and 1.30 are both 0.30 away.
    const firstAna = member(13_000_00, { name: 'Ana Lima' });
    const secondAna = member(7_000_00, { name: 'Ana Lima' });
    const bea = member(7_000_00, { name: 'Bea Costa' });
    const group = [
      bea,
      secondAna,
      member(10_000_00),
      firstAna,
      member(10_000_00),
      member(10_000_00),
    ];

    const { outliers } = findOutliers(group);

    expect(outliers.map((o) => o.employee)).toEqual(
      [firstAna, secondAna, bea].map((m) => m.employee),
    );
  });

  it.each([
    ['below', ['0.75', '0.79']],
    ['above', ['1.50', '1.30']],
  ] as const)('ranks only the %s outliers when asked for that direction', (direction, expected) => {
    // Median $10,000.00. Mixed, 1.50 (0.50 away) would come first and bury the underpaid.
    const salaries = { '0.75': 7_500_00, '0.79': 7_900_00, '1.30': 13_000_00, '1.50': 15_000_00 };
    const outliersBy = Object.fromEntries(
      Object.entries(salaries).map(([ratio, salary]) => [ratio, member(salary)]),
    );
    const group = [...Object.values(outliersBy), ...[1, 2, 3].map(() => member(10_000_00))];

    const { outliers } = findOutliers(group, direction);

    expect(outliers.map((o) => o.employee)).toEqual(
      expected.map((ratio) => outliersBy[ratio]?.employee),
    );
  });
});
