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

  it.each([
    // 7,996 / 10,000 = 0.7996 would round half up to 0.80, the boundary it is flagged for crossing.
    ['0.7996', 7_996_00, 10_000_00, 79],
    // 7,950 / 10,000 = 0.795 would round half up to 0.80 as well.
    ['0.795', 7_950_00, 10_000_00, 79],
    // Exactly 0.80 is not below it, so it stays 0.80.
    ['0.80', 8_000_00, 10_000_00, 80],
  ])('rounds a compa-ratio of %s down when it is below 0.80', (_, salary, median, hundredths) => {
    expect(compaRatioHundredths(salary, median)).toBe(hundredths);
  });

  it.each([
    // 12,004 / 10,000 = 1.2004 would round half up to 1.20, the boundary it is flagged for crossing.
    ['1.2004', 12_004_00, 10_000_00, 121],
    // Exactly 1.20 is not above it, so it stays 1.20.
    ['1.20', 12_000_00, 10_000_00, 120],
    // A whole hundredth above stays where it is: 13,000 / 10,000 = 1.30.
    ['1.30', 13_000_00, 10_000_00, 130],
  ])('rounds a compa-ratio of %s up when it is above 1.20', (_, salary, median, hundredths) => {
    expect(compaRatioHundredths(salary, median)).toBe(hundredths);
  });
});
