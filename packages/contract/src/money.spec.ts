import { describe, expect, it } from 'vitest';
import { moneySchema } from './index.js';

describe('moneySchema', () => {
  it('is a whole number of minor units with its currency', () => {
    expect(moneySchema.parse({ amountMinor: 1_250_000, currency: 'INR' })).toEqual({
      amountMinor: 1_250_000,
      currency: 'INR',
    });
  });

  it('rejects a fractional amount, an unsafe integer and an unsupported currency', () => {
    expect(moneySchema.safeParse({ amountMinor: 12.5, currency: 'USD' }).success).toBe(false);
    expect(moneySchema.safeParse({ amountMinor: 2 ** 53, currency: 'USD' }).success).toBe(false);
    expect(moneySchema.safeParse({ amountMinor: 100, currency: 'CHF' }).success).toBe(false);
  });
});
