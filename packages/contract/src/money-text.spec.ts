import { describe, expect, it } from 'vitest';
import { parseMoney } from './index.js';

describe('parseMoney', () => {
  it.each([
    ['1,250,000.50', 'INR', 125_000_050],
    ['1250000.50', 'INR', 125_000_050],
    ['12.5', 'USD', 1_250],
    ['120000', 'USD', 12_000_000],
    ['1,250,000', 'JPY', 1_250_000],
    [' 42 ', 'GBP', 4_200],
    // At the cap: ₹9,000,000,000.00 is 900,000,000,000 paise.
    ['9,000,000,000.00', 'INR', 900_000_000_000],
  ] as const)('reads "%s" %s as %d minor units', (input, currency, amountMinor) => {
    expect(parseMoney(input, currency)).toEqual({ success: true, amountMinor });
  });
});
