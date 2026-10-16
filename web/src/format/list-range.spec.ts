import { describe, expect, it } from 'vitest';
import { listRange } from './list-range';

describe('listRange', () => {
  it.each([
    [1, 25, 9_812, '1–25 of 9,812'],
    [2, 25, 9_812, '26–50 of 9,812'],
    [393, 25, 9_812, '9,801–9,812 of 9,812'],
    [1, 25, 1, '1–1 of 1'],
  ])('shows page %i, at %i a page, of %i employees as "%s"', (page, pageSize, total, text) => {
    expect(listRange({ page, pageSize, total })).toBe(text);
  });
});
