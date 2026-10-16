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

  it('doubles a quote inside a word, so it stays inside the quoted word', () => {
    expect(nameMatch('o"connor')).toBe('"o""connor"*');
    expect(nameMatch('"')).toBe('""""*');
  });

  it('is null for an empty or whitespace-only search, which means no search', () => {
    expect(nameMatch('')).toBeNull();
    expect(nameMatch(' \t ')).toBeNull();
  });
});
