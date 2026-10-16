import type { CountryCode } from '@acme/contract';
import { describe, expect, it } from 'vitest';
import { comparisonFootnote, highestMedianFirst } from './comparison-copy';

const row = (country: CountryCode, medianMinor: number | null) => ({
  country,
  median: medianMinor === null ? null : { amountMinor: medianMinor, currency: 'USD' as const },
});

describe('highestMedianFirst', () => {
  it('ranks countries by median USD, highest first, ties by country name, empty countries last', () => {
    const rows = [
      row('US', 100_000_00),
      row('GB', 120_000_00),
      row('DE', 100_000_00),
      row('NL', null),
      row('IN', 30_000_00),
      row('BR', null),
      row('JP', 100_000_01),
    ];

    // Germany and the United States tie at $100,000.00; Brazil and the Netherlands have no one.
    expect(highestMedianFirst(rows).map((r) => r.country)).toEqual([
      'GB',
      'JP',
      'DE',
      'US',
      'IN',
      'BR',
      'NL',
    ]);
    expect(rows[0]?.country).toBe('US');
  });
});

describe('comparisonFootnote', () => {
  it('names the rate source and date, and says the amounts are nominal', () => {
    expect(comparisonFootnote({ source: 'ECB reference rates', asOf: '2026-09-30' })).toBe(
      'Converted to USD at fixed rates from ECB reference rates, as of 2026-09-30. Each figure ' +
        'is converted from the local figure as shown, so it may differ slightly from converting ' +
        'individual salaries. Amounts are nominal, not adjusted for cost of living.',
    );
  });
});
