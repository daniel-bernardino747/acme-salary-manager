import { describe, expect, it } from 'vitest';
import { highestUsdFirst, outliersInCountryText, payrollFootnote, shareText } from './payroll-copy';

const usd = (amountMinor: number) => ({ amountMinor, currency: 'USD' as const });

describe('shareText', () => {
  it.each([
    ['a share to one decimal', 421, usd(42_100_00), '42.1%'],
    ['the whole payroll', 1000, usd(100_00), '100.0%'],
    ['no share, when the grand total is 0', null, usd(0), '–'],
    ['a positive total whose share rounds to 0', 0, usd(1), '<0.1%'],
    ['a part with no payroll at all', 0, usd(0), '0.0%'],
  ])('shows %s as "%s"', (_, sharePermille, total, text) => {
    expect(shareText(sharePermille, total)).toBe(text);
  });
});

describe('highestUsdFirst', () => {
  it('ranks rows by USD total, highest first, keeping the fixed order between equal totals', () => {
    const rows = [
      { department: 'Engineering', usd: usd(100_00) },
      { department: 'Product', usd: usd(300_00) },
      { department: 'Design', usd: usd(0) },
      { department: 'Data', usd: usd(100_00) },
    ];

    expect(highestUsdFirst(rows).map((row) => row.department)).toEqual([
      'Product',
      'Engineering',
      'Data',
      'Design',
    ]);
    expect(rows[0]?.department).toBe('Engineering');
  });
});

describe('payrollFootnote', () => {
  it('names the rate source and date, and says the parts may not add up', () => {
    expect(payrollFootnote({ source: 'ECB reference rates', asOf: '2026-09-30' })).toBe(
      'USD amounts converted at fixed rates from ECB reference rates, as of 2026-09-30. ' +
        'Each total is rounded on its own, so the parts may not add up exactly to the total, ' +
        'or to 100%.',
    );
  });
});

describe('outliersInCountryText', () => {
  it.each([
    ['IN', 'Outliers in India'],
    ['US', 'Outliers in the United States'],
    ['GB', 'Outliers in the United Kingdom'],
    ['NL', 'Outliers in the Netherlands'],
  ] as const)("names %s's outliers link as the sentence reads", (country, text) => {
    expect(outliersInCountryText(country)).toBe(text);
  });
});
