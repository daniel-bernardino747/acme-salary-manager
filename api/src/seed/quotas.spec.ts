import { countries, jobTitles } from '@acme/contract';
import { describe, expect, it } from 'vitest';
import { countryTotals, headcountQuotas, smallGroupOverrides } from './quotas';

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

  it('gives each of the five small-group overrides exactly its count, and every other cell at least 5', () => {
    const countOf = (jobTitle: string, country: string) =>
      quotas.find((q) => q.jobTitle === jobTitle && q.country === country)?.count;

    expect(countOf('Staff Software Engineer', 'BR')).toBe(0);
    expect(countOf('Staff Software Engineer', 'NL')).toBe(2);
    expect(countOf('Senior Data Scientist', 'JP')).toBe(1);
    expect(countOf('Sales Manager', 'NL')).toBe(4);
    expect(countOf('Senior Data Scientist', 'NL')).toBe(5);
    const others = quotas.filter(
      (q) =>
        !smallGroupOverrides.some((o) => o.jobTitle === q.jobTitle && o.country === q.country),
    );
    expect(others).toHaveLength(quotas.length - 5);
    expect(others.every((q) => q.count >= 5)).toBe(true);
  });
});
