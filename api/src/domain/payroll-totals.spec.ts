import {
  exchangeRates,
  type CountryCode,
  type CurrencyCode,
  type Department,
} from '@acme/contract';
import { describe, expect, it } from 'vitest';
import { payrollTotals, type PayrollEmployee } from './payroll-totals';

// Round rates keep the hand arithmetic readable: £2 and €3 to the dollar.
const rates = { ...exchangeRates.ratesPerUsd, GBP: 2_000_000, EUR: 3_000_000 };

const money = (amountMinor: number, currency: CurrencyCode) => ({ amountMinor, currency });

function employee(
  country: CountryCode,
  department: Department,
  amountMinor: number,
  currency: CurrencyCode,
): PayrollEmployee {
  return { country, department, annualSalary: money(amountMinor, currency) };
}

describe('payrollTotals', () => {
  it('gives every country, in fixed order, its local total, USD total, headcount and share', () => {
    // US $150,000.00 and GB £60,000.00 → $30,000.00, so the grand total is $180,000.00.
    // Shares: 150/180 = 833.3… → 833 and 30/180 = 166.6… → 167 permille.
    const totals = payrollTotals(
      [
        employee('US', 'Engineering', 100_000_00, 'USD'),
        employee('US', 'Sales', 50_000_00, 'USD'),
        employee('GB', 'Engineering', 60_000_00, 'GBP'),
      ],
      rates,
    );

    expect(totals.byCountry).toEqual([
      {
        country: 'US',
        headcount: 2,
        local: money(150_000_00, 'USD'),
        usd: money(150_000_00, 'USD'),
        sharePermille: 833,
      },
      {
        country: 'GB',
        headcount: 1,
        local: money(60_000_00, 'GBP'),
        usd: money(30_000_00, 'USD'),
        sharePermille: 167,
      },
      {
        country: 'DE',
        headcount: 0,
        local: money(0, 'EUR'),
        usd: money(0, 'USD'),
        sharePermille: 0,
      },
      {
        country: 'NL',
        headcount: 0,
        local: money(0, 'EUR'),
        usd: money(0, 'USD'),
        sharePermille: 0,
      },
      {
        country: 'IN',
        headcount: 0,
        local: money(0, 'INR'),
        usd: money(0, 'USD'),
        sharePermille: 0,
      },
      {
        country: 'BR',
        headcount: 0,
        local: money(0, 'BRL'),
        usd: money(0, 'USD'),
        sharePermille: 0,
      },
      {
        country: 'JP',
        headcount: 0,
        local: money(0, 'JPY'),
        usd: money(0, 'USD'),
        sharePermille: 0,
      },
    ]);
  });
});
