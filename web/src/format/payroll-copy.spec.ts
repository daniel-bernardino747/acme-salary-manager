import { describe, expect, it } from 'vitest';
import { highestUsdFirst, payrollHeadline, shareText } from './payroll-copy';

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

describe('payrollHeadline', () => {
  it.each([
    // $412,380,116.50 rounds half up to whole dollars.
    ['Annual payroll: $412,380,117 · 10,000 employees', 10_000, usd(412_380_116_50)],
    ['Annual payroll: $64,000 · 1 employee', 1, usd(64_000_00)],
    ['Annual payroll: $0 · 0 employees', 0, usd(0)],
  ])('heads the payroll as "%s"', (headline, headcount, total) => {
    expect(payrollHeadline({ headcount, usd: total })).toBe(headline);
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
