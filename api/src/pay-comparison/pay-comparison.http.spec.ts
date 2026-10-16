import { countries, exchangeRates, payComparisonResponseSchema } from '@acme/contract';
import { describe, expect, it } from 'vitest';
import { insertEmployee } from '../../test/builders';
import { useTestApp } from '../../test/http';

describe('GET /api/pay-comparison', () => {
  const t = useTestApp();

  it('answers with the job title in every supported country, in fixed order, with its rates', async () => {
    // US salaries only, so the wiring is checked without any conversion arithmetic.
    insertEmployee(t.db, { jobTitle: 'Accountant', country: 'US', annualSalaryMinor: 80_000_00 });
    insertEmployee(t.db, { jobTitle: 'Accountant', country: 'US', annualSalaryMinor: 90_000_00 });
    // Another title: not compared.
    insertEmployee(t.db, { jobTitle: 'Recruiter', country: 'US', annualSalaryMinor: 1_00 });

    const res = await t
      .http()
      .get('/api/pay-comparison')
      .query({ jobTitle: 'Accountant' })
      .expect(200);

    const comparison = payComparisonResponseSchema.parse(res.body);
    expect(comparison.jobTitle).toBe('Accountant');
    expect(comparison.rows.map((row) => row.country)).toEqual(countries.map((c) => c.code));
    expect(comparison.rows[0]).toMatchObject({
      country: 'US',
      headcount: 2,
      min: { amountMinor: 80_000_00, currency: 'USD' },
      max: { amountMinor: 90_000_00, currency: 'USD' },
    });
    expect(comparison.rates).toEqual({ source: exchangeRates.source, asOf: exchangeRates.asOf });
  });
});
