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

  // The tokenizer folds case and accents, so the builder leaves them alone.
  it.each([
    ['João MÜLLER', '"João"* AND "MÜLLER"*'],
    ['pri AND sha', '"pri"* AND "AND"* AND "sha"*'],
    ['OR NOT NEAR', '"OR"* AND "NOT"* AND "NEAR"*'],
    ['-sharma', '"-sharma"*'],
    ['pri -', '"pri"* AND "-"*'],
    ['*', '"*"*'],
    ['name:priya', '"name:priya"*'],
    ['(priya)', '"(priya)"*'],
    ['^pri', '"^pri"*'],
  ])('keeps %j as quoted text, never FTS5 syntax', (search, match) => {
    expect(nameMatch(search)).toBe(match);
  });

  it('is null for an empty or whitespace-only search, which means no search', () => {
    expect(nameMatch('')).toBeNull();
    expect(nameMatch(' \t ')).toBeNull();
  });
});
