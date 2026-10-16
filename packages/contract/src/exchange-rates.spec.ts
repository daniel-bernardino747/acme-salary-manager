import { describe, expect, it } from 'vitest';
import { deriveRatePerUsd, ecbReferenceRates, exchangeRates } from './index.js';

describe('deriveRatePerUsd', () => {
  it('divides EUR→local by EUR→USD to 6 decimals, rounding half up', () => {
    // 1088205 · 10⁶ = 1,088,205,000,000 and 11355 · 95,834,874 = 1,088,204,994,270, so the
    // remainder is 5,730 and 2 · 5,730 ≥ 11,355 rounds up: 95.834875 INR per USD.
    expect(deriveRatePerUsd('108.8205', '1.1355')).toBe(95_834_875);
  });

  it('rounds down below half', () => {
    // 1 / 1.1355 = 0.8806693…, so 880,669 millionths.
    expect(deriveRatePerUsd('1', '1.1355')).toBe(880_669);
  });
});

describe('exchange rate table', () => {
  const { perEur } = ecbReferenceRates;

  it('is dated and sourced from the ECB reference rates of 2026-09-30', () => {
    expect(ecbReferenceRates.date).toBe('2026-09-30');
    expect(exchangeRates.asOf).toBe('2026-09-30');
    expect(exchangeRates.source).toMatch(/ECB/);
  });

  it('stores USD as exactly 1', () => {
    expect(exchangeRates.ratesPerUsd.USD).toBe(1_000_000);
  });

  it('stores INR as derived by hand from the published figures', () => {
    // See deriveRatePerUsd above: 108.8205 / 1.1355, rounded half up.
    expect(perEur.INR).toBe('108.8205');
    expect(perEur.USD).toBe('1.1355');
    expect(exchangeRates.ratesPerUsd.INR).toBe(95_834_875);
  });

  it('stores every other currency as derived from the published figures', () => {
    expect(exchangeRates.ratesPerUsd).toEqual({
      USD: 1_000_000,
      GBP: deriveRatePerUsd(perEur.GBP, perEur.USD),
      EUR: deriveRatePerUsd('1', perEur.USD),
      INR: deriveRatePerUsd(perEur.INR, perEur.USD),
      BRL: deriveRatePerUsd(perEur.BRL, perEur.USD),
      JPY: deriveRatePerUsd(perEur.JPY, perEur.USD),
    });
  });
});
