import { countries } from '@acme/contract';
import { describe, expect, it } from 'vitest';
import { countryStamp } from './country-stamp';

describe('countryStamp', () => {
  it.each([
    ['US', 'US · USD'],
    ['GB', 'GB · GBP'],
    ['DE', 'DE · EUR'],
    ['NL', 'NL · EUR'],
    ['IN', 'IN · INR'],
    ['BR', 'BR · BRL'],
    ['JP', 'JP · JPY'],
  ] as const)('stamps %s with its currency', (country, stamp) => {
    expect(countryStamp(country)).toBe(stamp);
  });

  it('gives every supported country a stamp of its own', () => {
    const stamps = countries.map(({ code }) => countryStamp(code));

    expect(new Set(stamps).size).toBe(countries.length);
  });
});
