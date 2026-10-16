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

  it('gives every department, in fixed order, its USD total, converting each currency subtotal once', () => {
    // Engineering's GBP subtotal £110,000.02 converts once to $55,000.01. Converting each salary
    // would give $25,000.01 + $30,000.01 = $55,000.02. So Engineering is $155,000.01, Sales
    // $45,000.00, and the grand total $200,000.01.
    // Shares: 15,500,001/20,000,001 = 0.7750000… → 775, and 4,500,000/20,000,001 = 0.2249999… → 225.
    const totals = payrollTotals(
      [
        employee('US', 'Engineering', 100_000_00, 'USD'),
        employee('GB', 'Engineering', 50_000_01, 'GBP'),
        employee('GB', 'Engineering', 60_000_01, 'GBP'),
        employee('US', 'Sales', 45_000_00, 'USD'),
      ],
      rates,
    );

    const none = (department: Department) => ({
      department,
      headcount: 0,
      usd: money(0, 'USD'),
      sharePermille: 0,
    });
    expect(totals.byDepartment).toEqual([
      {
        department: 'Engineering',
        headcount: 3,
        usd: money(155_000_01, 'USD'),
        sharePermille: 775,
      },
      none('Product'),
      none('Design'),
      none('Data'),
      { department: 'Sales', headcount: 1, usd: money(45_000_00, 'USD'), sharePermille: 225 },
      none('Marketing'),
      none('Customer Support'),
      none('People'),
      none('Finance'),
    ]);
  });

  it('gives the grand total in USD with its headcount, converting each currency subtotal once', () => {
    // £1.01 + £1.01 = £2.02 converts once to $1.01. Converting each salary would give 51¢ + 51¢.
    const totals = payrollTotals(
      [
        employee('US', 'Engineering', 10_00, 'USD'),
        employee('GB', 'Sales', 1_01, 'GBP'),
        employee('GB', 'Finance', 1_01, 'GBP'),
      ],
      rates,
    );

    expect(totals.grandTotal).toEqual({ headcount: 3, usd: money(11_01, 'USD') });
  });

  it('gives no share, never 0, when the grand total is 0', () => {
    const totals = payrollTotals([], rates);

    expect(totals.grandTotal).toEqual({ headcount: 0, usd: money(0, 'USD') });
    expect(totals.byCountry.map((row) => row.sharePermille)).toEqual(Array(7).fill(null));
    expect(totals.byDepartment.map((row) => row.sharePermille)).toEqual(Array(9).fill(null));
  });

  it('keeps a country row each for Germany and the Netherlands, sharing one EUR subtotal elsewhere', () => {
    // Each country's €50,000.00 converts on its own to $16,666.666… → $16,666.67. Their shared
    // €100,000.00 converts once to $33,333.333… → $33,333.33 for Engineering and the grand total,
    // a cent less than the two country rows added up. Each country's share: 1,666,667/3,333,333 =
    // 0.50000015 → 500.
    const totals = payrollTotals(
      [
        employee('DE', 'Engineering', 50_000_00, 'EUR'),
        employee('NL', 'Engineering', 50_000_00, 'EUR'),
      ],
      rates,
    );

    expect(totals.byCountry.filter((row) => row.headcount > 0)).toEqual([
      {
        country: 'DE',
        headcount: 1,
        local: money(50_000_00, 'EUR'),
        usd: money(16_666_67, 'USD'),
        sharePermille: 500,
      },
      {
        country: 'NL',
        headcount: 1,
        local: money(50_000_00, 'EUR'),
        usd: money(16_666_67, 'USD'),
        sharePermille: 500,
      },
    ]);
    expect(totals.byDepartment[0]).toEqual({
      department: 'Engineering',
      headcount: 2,
      usd: money(33_333_33, 'USD'),
      sharePermille: 1000,
    });
    expect(totals.grandTotal).toEqual({ headcount: 2, usd: money(33_333_33, 'USD') });
  });
});
