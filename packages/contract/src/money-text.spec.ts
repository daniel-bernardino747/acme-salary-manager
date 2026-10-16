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

describe('parseMoney rejects', () => {
  const FORMAT = 'Use digits, comma thousands separators and a decimal point';

  it('any decimals for JPY, which has no minor unit', () => {
    expect(parseMoney('100.5', 'JPY')).toEqual({ success: false, error: 'JPY has no decimals' });
    expect(parseMoney('100.0', 'JPY')).toEqual({ success: false, error: 'JPY has no decimals' });
  });

  it("more decimals than the currency's minor unit allows", () => {
    expect(parseMoney('1.255', 'USD')).toEqual({
      success: false,
      error: 'USD takes at most 2 decimals',
    });
  });

  it.each([
    '1.250.000,50',
    '1,25,000',
    '12,50',
    '$100',
    '-5',
    '1e5',
    '1 000',
    '1.',
    '.5',
    '',
    '   ',
  ])('"%s", which is not the en format', (input) => {
    expect(parseMoney(input, 'USD')).toEqual({ success: false, error: FORMAT });
  });

  it('an amount whose minor units pass 2⁵³', () => {
    expect(parseMoney('90,071,992,547,409.92', 'USD')).toEqual({
      success: false,
      error: 'Amount is too large',
    });
  });
});
