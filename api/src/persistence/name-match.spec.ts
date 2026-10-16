import { describe, expect, it } from 'vitest';
import { nameMatch } from './name-match';

describe('nameMatch', () => {
  it('quotes a word and makes it a prefix', () => {
    expect(nameMatch('priya')).toBe('"priya"*');
  });

  it('makes every word a prefix and requires them all', () => {
    expect(nameMatch('pri sha')).toBe('"pri"* AND "sha"*');
    expect(nameMatch('  pri \t  sha ')).toBe('"pri"* AND "sha"*');
  });
});
