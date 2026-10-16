import { exchangeRates, outliersResponseSchema, problemSchema } from '@acme/contract';
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

    // Only the field's wiring: the ranking is pinned by the domain fixtures.
    const { items } = outliersResponseSchema.parse(res.body);
    const gapOf = (id: number) => items.find((o) => o.employee.id === id)?.gapMinor;
    expect(gapOf(underpaid.id)).toBe(1_000_00);
    expect(gapOf(overpaid.id)).toBeNull();
  });

  it('reports the same peer median with a department filter, since it never narrows the peer group', async () => {
    // The whole group: 7,000 · 10,000 · 10,000 · 12,000 · 12,000, median $10,000.00. Product alone
    // (7,000 · 12,000 · 12,000) would give $12,000.00, and would be too small to check.
    const group = { jobTitle: 'Product Manager', country: 'US' } as const;
    const underpaid = insertEmployee(t.db, {
      ...group,
      department: 'Product',
      annualSalaryMinor: 7_000_00,
    });
    insertEmployee(t.db, { ...group, department: 'Product', annualSalaryMinor: 12_000_00 });
    insertEmployee(t.db, { ...group, department: 'Product', annualSalaryMinor: 12_000_00 });
    insertEmployee(t.db, { ...group, department: 'Sales', annualSalaryMinor: 10_000_00 });
    insertEmployee(t.db, { ...group, department: 'Sales', annualSalaryMinor: 10_000_00 });

    const all = outliersResponseSchema.parse((await t.http().get('/api/outliers')).body);
    const filtered = outliersResponseSchema.parse(
      (await t.http().get('/api/outliers').query({ department: 'Product' }).expect(200)).body,
    );

    expect(filtered.items.map((o) => o.employee.id)).toEqual([underpaid.id]);
    expect(filtered.items[0]?.peerMedian).toEqual(all.items[0]?.peerMedian);
    expect(filtered.items[0]).toMatchObject({
      peerMedian: { amountMinor: 10_000_00, currency: 'USD' },
      peerHeadcount: 5,
    });
  });

  it.each([
    ['an unknown direction', { direction: 'all' }, ['direction']],
    ['a country not in the list', { country: 'UK' }, ['country']],
    ['a department not in the list', { department: 'Legal' }, ['department']],
    ['a job title not in the list', { jobTitle: 'Product Managers' }, ['jobTitle']],
    ['a page below 1', { page: 0 }, ['page']],
    ['a page size above 100', { pageSize: 101 }, ['pageSize']],
    ['a name search, which outliers do not take', { q: 'priya' }, []],
    ['an unknown parameter', { contry: 'IN' }, []],
  ])('answers %s with a 400 problem', async (_, query, path) => {
    const res = await t.http().get('/api/outliers').query(query).expect(400);

    expect(res.headers['content-type']).toMatch(/^application\/problem\+json/);
    const problem = problemSchema.parse(res.body);
    expect(problem).toMatchObject({
      title: 'Validation failed',
      status: 400,
      detail: 'Query is invalid',
    });
    expect(problem.errors?.map((error) => error.path)).toEqual([path]);
  });
});
