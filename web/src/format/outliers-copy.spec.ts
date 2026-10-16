import { describe, expect, it } from 'vitest';
import {
  costFootnote,
  costText,
  noOutliersText,
  outliersHeadline,
  smallGroupCountText,
} from './outliers-copy';

describe('outliersHeadline', () => {
  it.each([
    [38, 'below', '38 employees paid below 0.80 of their peer median'],
    [6, 'above', '6 employees paid above 1.20 of their peer median'],
    [1_204, 'all', '1,204 employees paid outside 0.80–1.20 of their peer median'],
    [1, 'below', '1 employee paid below 0.80 of their peer median'],
  ] as const)('heads %i outliers in direction %s as "%s"', (total, direction, headline) => {
    expect(outliersHeadline(total, direction)).toBe(headline);
  });
});

describe('costText', () => {
  it.each([
    // $80,898.32 rounds to whole dollars, down.
    [80_898_32, 'Bringing them to 0.80 would cost $80,898 a year.'],
    // An exact half dollar rounds up.
    [1_234_50, 'Bringing them to 0.80 would cost $1,235 a year.'],
    [0, 'Bringing them to 0.80 would cost $0 a year.'],
  ])('states a cost of %i cents in whole USD', (amountMinor, text) => {
    expect(costText({ amountMinor, currency: 'USD' })).toBe(text);
  });
});

describe('smallGroupCountText', () => {
  it.each([
    [12, "12 employees in small groups weren't checked."],
    [1, "1 employee in a small group wasn't checked."],
    [0, "0 employees in small groups weren't checked."],
  ])('counts %i employees in small groups as "%s"', (smallGroupHeadcount, text) => {
    expect(smallGroupCountText(smallGroupHeadcount)).toBe(text);
  });
});

describe('noOutliersText', () => {
  it.each([
    ['below', 'No underpaid employees for these filters.'],
    ['above', 'No overpaid employees for these filters.'],
    ['all', 'No employees paid out of line for these filters.'],
  ] as const)('says nobody matched in direction %s', (direction, text) => {
    expect(noOutliersText(direction)).toBe(text);
  });
});

describe('costFootnote', () => {
  it('names the rate source and date, and says each currency is converted once', () => {
    expect(costFootnote({ source: 'ECB reference rates', asOf: '2026-09-30' })).toBe(
      'The cost is converted to USD at fixed rates from ECB reference rates, as of 2026-09-30. ' +
        "Each currency's gaps are added up first and converted once.",
    );
  });
});
