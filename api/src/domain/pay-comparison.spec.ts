import { countries, exchangeRates, type CountryCode, type CurrencyCode } from '@acme/contract';
import { describe, expect, it } from 'vitest';
import { payComparison, type CountrySalary } from './pay-comparison';

// Round rates keep the hand arithmetic readable: £2 and ¥150 to the dollar.
const rates = { ...exchangeRates.ratesPerUsd, GBP: 2_000_000, JPY: 150_000_000 };

const usd = (amountMinor: number) => ({ amountMinor, currency: 'USD' });

function salary(country: CountryCode, amountMinor: number, currency: CurrencyCode): CountrySalary {
  return { country, annualSalary: { amountMinor, currency } };
}

describe('payComparison', () => {
  it('gives every supported country, in fixed order, its headcount and pay statistics in USD', () => {
    // Sorted: $90,000.00 · $95,000.00 · $100,000.00 · $110,000.00 · $120,000.01.
    // Average 51,500,001 / 5 = 10,300,000.2 → 10,300,000.
    const rows = payComparison(
      [
        salary('US', 100_000_00, 'USD'),
        salary('US', 90_000_00, 'USD'),
        salary('US', 120_000_01, 'USD'),
        salary('US', 95_000_00, 'USD'),
        salary('US', 110_000_00, 'USD'),
      ],
      rates,
    );

    expect(rows.map((row) => row.country)).toEqual(countries.map((country) => country.code));
    expect(rows[0]).toEqual({
      country: 'US',
      headcount: 5,
      smallGroup: false,
      min: usd(90_000_00),
      median: usd(100_000_00),
      average: usd(103_000_00),
      max: usd(120_000_01),
    });
  });
});
