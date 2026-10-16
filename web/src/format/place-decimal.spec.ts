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

  it.each([
    [-5, 2, 'a negative value'],
    [7.9, 2, 'a value that is not an integer'],
    [Number.NaN, 2, 'NaN'],
    [79, 0, 'no decimals, which would leave a trailing point'],
    [79, 1.5, 'a fractional number of decimals'],
  ])('rejects %d with %d decimals (%s)', (value, decimals) => {
    expect(() => placeDecimal(value, decimals)).toThrow(RangeError);
  });
});
