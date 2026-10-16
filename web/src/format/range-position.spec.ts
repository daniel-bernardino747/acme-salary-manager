import { describe, expect, it } from 'vitest';
import { rangePosition } from './range-position';

describe('rangePosition (geometry only, never shown as text)', () => {
  it('places the ends of a range at 0 and 100', () => {
    expect(rangePosition(100, 100, 300)).toBe(0);
    expect(rangePosition(300, 100, 300)).toBe(100);
  });

  it('places a value proportionally between them', () => {
    expect(rangePosition(150, 100, 300)).toBe(25);
  });

  it('centres every value when the range has no width, as in a one-person group', () => {
    expect(rangePosition(500, 500, 500)).toBe(50);
  });

  it('keeps a value outside the range on its edge', () => {
    expect(rangePosition(50, 100, 300)).toBe(0);
    expect(rangePosition(900, 100, 300)).toBe(100);
  });
});
