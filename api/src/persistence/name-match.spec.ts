import { describe, expect, it } from 'vitest';
import { nameMatch } from './name-match';

describe('nameMatch', () => {
  it('quotes a word and makes it a prefix', () => {
    expect(nameMatch('priya')).toBe('"priya"*');
  });
});
