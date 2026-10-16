import { countries, exchangeRates, type CountryCode, type CurrencyCode } from '@acme/contract';
import { describe, expect, it } from 'vitest';
import { payComparison, type CountrySalary } from './pay-comparison';

// Round rates keep the hand arithmetic readable: £2, ₹100 and ¥150 to the dollar.
const rates = {
  ...exchangeRates.ratesPerUsd,
  GBP: 2_000_000,
  INR: 100_000_000,
  JPY: 150_000_000,
};

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

  it('converts each local figure as shown, once, so the median and average carry two roundings', () => {
    // The median of £50,000.00 and £50,000.01 is 5,000,000.5p → £50,000.01 as shown, and so is
    // the average. At £2 to the dollar that is 2,500,000.5¢ → $25,000.01. Converting the exact
    // £50,000.005 would round once, to 2,500,000.25¢ → $25,000.00.
    const rows = payComparison(
      [salary('GB', 50_000_00, 'GBP'), salary('GB', 50_000_01, 'GBP')],
      rates,
    );

    expect(rows.find((row) => row.country === 'GB')).toEqual({
      country: 'GB',
      headcount: 2,
      smallGroup: true,
      min: usd(25_000_00),
      median: usd(25_000_01),
      average: usd(25_000_01),
      max: usd(25_000_01),
    });
  });

  it('gives a country with no employees of the title headcount 0 and null figures, never 0', () => {
    const rows = payComparison([salary('US', 100_000_00, 'USD')], rates);

    expect(rows.find((row) => row.country === 'NL')).toEqual({
      country: 'NL',
      headcount: 0,
      smallGroup: false,
      min: null,
      median: null,
      average: null,
      max: null,
    });
  });

  it('marks a country of 1 to 4 employees as a small group, its figures still shown in USD', () => {
    // ₹2,000,000.00 to ₹3,500,000.00 at ₹100 to the dollar: $20,000.00 to $35,000.00. The median
    // (₹2,500,000.00 + ₹3,000,000.00) / 2 and the average ₹11,000,000.00 / 4 are both
    // ₹2,750,000.00 → $27,500.00.
    const rows = payComparison(
      [
        salary('IN', 2_000_000_00, 'INR'),
        salary('IN', 3_500_000_00, 'INR'),
        salary('IN', 2_500_000_00, 'INR'),
        salary('IN', 3_000_000_00, 'INR'),
      ],
      rates,
    );

    expect(rows.find((row) => row.country === 'IN')).toEqual({
      country: 'IN',
      headcount: 4,
      smallGroup: true,
      min: usd(20_000_00),
      median: usd(27_500_00),
      average: usd(27_500_00),
      max: usd(35_000_00),
    });
  });
});
