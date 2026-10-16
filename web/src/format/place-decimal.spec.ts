import { describe, expect, it } from 'vitest';
import { placeDecimal } from './place-decimal';

describe('placeDecimal', () => {
  it.each([
    // compaRatioHundredths
    [79, 2, '0.79'],
    [120, 2, '1.20'],
    [5, 2, '0.05'],
    // sharePermille
    [421, 1, '42.1'],
    [1000, 1, '100.0'],
    [0, 1, '0.0'],
  ])('places the point in %i with %i decimals as "%s"', (value, decimals, text) => {
    expect(placeDecimal(value, decimals)).toBe(text);
  });
});
