import { exchangeRates, outliersResponseSchema } from '@acme/contract';
import { describe, expect, it } from 'vitest';
import { insertEmployee } from '../../test/builders';
import { useTestApp } from '../../test/http';

describe('GET /api/outliers', () => {
  const t = useTestApp();

  /** A peer group of 5 with a $10,000.00 median: one at 0.70, three on it and one at 1.10. */
  function insertGroupWithOneUnderpaid() {
    const group = { jobTitle: 'Product Manager', country: 'US', department: 'Product' } as const;
    const underpaid = insertEmployee(t.db, { ...group, annualSalaryMinor: 7_000_00 });
    for (const salary of [10_000_00, 10_000_00, 10_000_00, 11_000_00]) {
      insertEmployee(t.db, { ...group, annualSalaryMinor: salary });
    }
    return underpaid;
  }

  it('answers with the list envelope of outliers and the count of employees in small groups', async () => {
    const underpaid = insertGroupWithOneUnderpaid();
    // A peer group of 2, never checked.
    insertEmployee(t.db, { jobTitle: 'Recruiter', country: 'US', annualSalaryMinor: 1_00 });
    insertEmployee(t.db, { jobTitle: 'Recruiter', country: 'US', annualSalaryMinor: 90_000_00 });

    const res = await t.http().get('/api/outliers').expect(200);

    const page = outliersResponseSchema.parse(res.body);
    expect(page).toMatchObject({ page: 1, pageSize: 25, total: 1, smallGroupHeadcount: 2 });
    expect(page.items.map((o) => o.employee.id)).toEqual([underpaid.id]);
    expect(page.items[0]).toMatchObject({
      peerMedian: { amountMinor: 10_000_00, currency: 'USD' },
      peerHeadcount: 5,
      compaRatioHundredths: 70,
      direction: 'below',
    });
  });

  it('answers direction=below with the cost to reach 0.80 in USD and the rates that converted it', async () => {
    // $7,000.00 is $1,000.00 short of 0.80 · $10,000.00, all in USD, so no conversion arithmetic.
    insertGroupWithOneUnderpaid();

    const res = await t.http().get('/api/outliers').query({ direction: 'below' }).expect(200);

    const page = outliersResponseSchema.parse(res.body);
    expect(page.costToReachThreshold).toEqual({ usd: { amountMinor: 1_000_00, currency: 'USD' } });
    expect(page.rates).toEqual({ source: exchangeRates.source, asOf: exchangeRates.asOf });
  });

  it.each([
    ['direction=above', { direction: 'above' }],
    ['no direction', {}],
  ])(
    'answers %s with no cost and no rates: only an underpaid list states one',
    async (_, query) => {
      insertGroupWithOneUnderpaid();

      const res = await t.http().get('/api/outliers').query(query).expect(200);

      expect(outliersResponseSchema.parse(res.body)).not.toHaveProperty('costToReachThreshold');
      expect(res.body).not.toHaveProperty('rates');
    },
  );

  it('answers with one page of the ranking, while the total and the cost cover every page', async () => {
    // Median $10,000.00: 0.70 ranks before 0.75. Their gaps are $1,000.00 and $500.00.
    const group = { jobTitle: 'Product Manager', country: 'US' } as const;
    insertEmployee(t.db, { ...group, annualSalaryMinor: 7_000_00 });
    const second = insertEmployee(t.db, { ...group, annualSalaryMinor: 7_500_00 });
    for (const salary of [10_000_00, 10_000_00, 11_000_00]) {
      insertEmployee(t.db, { ...group, annualSalaryMinor: salary });
    }

    const res = await t
      .http()
      .get('/api/outliers')
      .query({ direction: 'below', page: 2, pageSize: 1 })
      .expect(200);

    const page = outliersResponseSchema.parse(res.body);
    expect(page).toMatchObject({ page: 2, pageSize: 1, total: 2 });
    expect(page.items.map((o) => o.employee.id)).toEqual([second.id]);
    expect(page.costToReachThreshold?.usd).toEqual({ amountMinor: 1_500_00, currency: 'USD' });
  });

  it('sets the gap to 0.80 on underpaid rows and leaves it null on overpaid ones', async () => {
    // Median $10,000.00: $7,000.00 is $1,000.00 short; $14,000.00 is overpaid.
    const group = { jobTitle: 'Product Manager', country: 'US' } as const;
    const underpaid = insertEmployee(t.db, { ...group, annualSalaryMinor: 7_000_00 });
    const overpaid = insertEmployee(t.db, { ...group, annualSalaryMinor: 14_000_00 });
    for (const salary of [10_000_00, 10_000_00, 10_000_00]) {
      insertEmployee(t.db, { ...group, annualSalaryMinor: salary });
    }

    const res = await t.http().get('/api/outliers').expect(200);

    const { items } = outliersResponseSchema.parse(res.body);
    expect(items.map((o) => [o.employee.id, o.direction, o.gapMinor])).toEqual([
      [overpaid.id, 'above', null],
      [underpaid.id, 'below', 1_000_00],
    ]);
  });
});
