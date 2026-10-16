import type { Money } from '@acme/contract';
import { describe, expect, it } from 'vitest';
import { overviewDateLine, shareBars, topOutliers } from './overview';

const usd = (amountMinor: number): Money => ({ amountMinor, currency: 'USD' });

describe('topOutliers', () => {
  it('takes the first five of the API ranking, most extreme first, without reordering', () => {
    const ranked = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];

    expect(topOutliers(ranked)).toEqual(['a', 'b', 'c', 'd', 'e']);
  });

  it('takes all of a shorter ranking', () => {
    expect(topOutliers(['a', 'b'])).toEqual(['a', 'b']);
  });
});

describe('shareBars', () => {
  it('ranks countries by USD total and draws each bar against the largest share', () => {
    const bars = shareBars([
      { country: 'GB', usd: usd(102), sharePermille: 153 },
      { country: 'US', usd: usd(346), sharePermille: 518 },
      { country: 'BR', usd: usd(28), sharePermille: 0 },
    ]);

    expect(bars.map(({ country, width }) => [country, width])).toEqual([
      ['US', 100],
      ['GB', (153 / 518) * 100],
      ['BR', 0],
    ]);
  });

  it('draws no bars when there is no grand total to share', () => {
    const bars = shareBars([
      { country: 'US', usd: usd(0), sharePermille: null },
      { country: 'GB', usd: usd(0), sharePermille: null },
    ]);

    expect(bars.map(({ width }) => width)).toEqual([0, 0]);
  });
});

describe('overviewDateLine', () => {
  it("states today's date and how many employees work in how many countries", () => {
    expect(overviewDateLine(new Date(2026, 9, 16), 10_000, 7)).toBe(
      'Friday, October 16, 2026 · 10,000 employees in 7 countries',
    );
  });

  it('counts the countries that have employees, one in the singular', () => {
    expect(overviewDateLine(new Date(2026, 0, 1), 1, 1)).toBe(
      'Thursday, January 1, 2026 · 1 employee in 1 country',
    );
  });
});
