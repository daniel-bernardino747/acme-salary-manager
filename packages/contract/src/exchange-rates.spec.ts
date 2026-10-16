import { describe, expect, it } from 'vitest';
import { deriveRatePerUsd } from './index.js';

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
