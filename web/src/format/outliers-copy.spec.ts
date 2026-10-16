import { describe, expect, it } from 'vitest';
import { outliersHeadline } from './outliers-copy';

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
