import { describe, expect, it } from 'vitest';
import { shareText } from './payroll-copy';

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
