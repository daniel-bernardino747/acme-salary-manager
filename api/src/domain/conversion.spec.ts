import { exchangeRates } from '@acme/contract';
import { describe, expect, it } from 'vitest';
import { toUsd } from './conversion';

describe('toUsd', () => {
  it('leaves USD as it is', () => {
    expect(toUsd({ amountMinor: 123_456_789, currency: 'USD' })).toEqual({
      amountMinor: 123_456_789,
      currency: 'USD',
    });
  });

  it('converts JPY, which has no minor unit, at the shipped rate', () => {
    // ¥15,000,000 · 10² · 10⁶ = 1.5 · 10¹⁵ over 156,996,918 is 9,554,327 remainder 107,435,814,
    // and 2 · 107,435,814 ≥ 156,996,918 rounds up.
    expect(toUsd({ amountMinor: 15_000_000, currency: 'JPY' })).toEqual({
      amountMinor: 9_554_328,
      currency: 'USD',
    });
  });

  it('rounds an exact half cent up', () => {
    // At 2 GBP per USD, £1.01 is $0.505.
    const rates = { ...exchangeRates.ratesPerUsd, GBP: 2_000_000 };
    expect(toUsd({ amountMinor: 101, currency: 'GBP' }, rates).amountMinor).toBe(51);
  });

  it('converts a total whose product passes 2⁵³ exactly, through BigInt', () => {
    // 9,007,199,254,740,991 / 3 = 3,002,399,751,580,330 remainder 1, so it rounds down.
    // In floats, the product · 10⁶ loses its last digits and the result comes out at …330.5.
    const rates = { ...exchangeRates.ratesPerUsd, GBP: 3_000_000 };
    expect(toUsd({ amountMinor: Number.MAX_SAFE_INTEGER, currency: 'GBP' }, rates).amountMinor).toBe(
      3_002_399_751_580_330,
    );
  });

  it('refuses a result that is not a safe integer', () => {
    const rates = { ...exchangeRates.ratesPerUsd, GBP: 1 };
    expect(() => toUsd({ amountMinor: 10_000_000_000, currency: 'GBP' }, rates)).toThrow(
      RangeError,
    );
  });
});
