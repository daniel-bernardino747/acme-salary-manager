import { exchangeRates, payrollTotalsResponseSchema } from '@acme/contract';
import { describe, expect, it } from 'vitest';
import { insertEmployee } from '../../test/builders';
import { useTestApp } from '../../test/http';

describe('GET /api/payroll-totals', () => {
  const t = useTestApp();

  it('answers with the totals per country and per department, the grand total and its rates', async () => {
    // US salaries only, so the wiring is checked without any conversion arithmetic.
    insertEmployee(t.db, { country: 'US', department: 'Sales', annualSalaryMinor: 90_000_00 });
    insertEmployee(t.db, { country: 'US', department: 'Data', annualSalaryMinor: 110_000_00 });

    const res = await t.http().get('/api/payroll-totals').expect(200);

    const totals = payrollTotalsResponseSchema.parse(res.body);
    const usd = { amountMinor: 200_000_00, currency: 'USD' };
    expect(totals.grandTotal).toEqual({ headcount: 2, usd });
    expect(totals.byCountry.find((row) => row.country === 'US')).toEqual({
      country: 'US',
      headcount: 2,
      local: usd,
      usd,
      sharePermille: 1000,
    });
    expect(totals.byDepartment.find((row) => row.department === 'Sales')).toMatchObject({
      headcount: 1,
      usd: { amountMinor: 90_000_00, currency: 'USD' },
    });
    expect(totals.rates).toEqual({ source: exchangeRates.source, asOf: exchangeRates.asOf });
  });

  it('answers an empty organization with 200, a $0 grand total and no shares', async () => {
    const res = await t.http().get('/api/payroll-totals').expect(200);

    const totals = payrollTotalsResponseSchema.parse(res.body);
    expect(totals.grandTotal).toEqual({ headcount: 0, usd: { amountMinor: 0, currency: 'USD' } });
    expect(
      [...totals.byCountry, ...totals.byDepartment].every(
        (row) => row.headcount === 0 && row.sharePermille === null,
      ),
    ).toBe(true);
    expect(totals.rates).toEqual({ source: exchangeRates.source, asOf: exchangeRates.asOf });
  });
});
