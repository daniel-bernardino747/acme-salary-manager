import { countries, jobTitles } from '@acme/contract';
import { describe, expect, it } from 'vitest';
import { countryTotals, headcountQuotas } from './quotas';

describe('headcountQuotas', () => {
  const quotas = headcountQuotas();
  const sum = (counts: readonly number[]) => counts.reduce((a, b) => a + b, 0);

  it('has one cell per title and country, sums to each country total exactly and to 10,000, with no negative cell', () => {
    expect(quotas).toHaveLength(countries.length * jobTitles.length);
    for (const { code } of countries) {
      const cells = quotas.filter((q) => q.country === code);
      expect(cells.map((q) => q.jobTitle)).toEqual(jobTitles);
      expect(sum(cells.map((q) => q.count))).toBe(countryTotals[code]);
    }
    expect(sum(quotas.map((q) => q.count))).toBe(10_000);
    expect(quotas.every((q) => Number.isInteger(q.count) && q.count >= 0)).toBe(true);
  });
});
