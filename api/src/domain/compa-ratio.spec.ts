import { describe, expect, it } from 'vitest';
import { compaRatioHundredths } from './compa-ratio';

describe('compaRatioHundredths', () => {
  it.each([
    // 199 / 200 = 0.995 is exactly half a hundredth, so it rounds up to 1.00.
    ['0.995', 199_00, 200_00, 100],
    // 10,049 / 10,000 = 1.0049 rounds down to 1.00.
    ['1.0049', 10_049_00, 10_000_00, 100],
    // 8,150 / 10,000 = 0.815 rounds up to 0.82.
    ['0.815', 8_150_00, 10_000_00, 82],
  ])('rounds a compa-ratio of %s, inside 0.80–1.20, half up', (_, salary, median, hundredths) => {
    expect(compaRatioHundredths(salary, median)).toBe(hundredths);
  });
});
