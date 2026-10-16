import { countries } from '@acme/contract';
import { describe, expect, it } from 'vitest';
import { namesByCountry } from './names';

describe('namesByCountry', () => {
  it.each(countries.map((c) => c.code))(
    'has 50 distinct given and 50 distinct family names for %s, in Latin script, with no ß',
    (code) => {
      const { given, family } = namesByCountry[code];
      for (const list of [given, family]) {
        expect(list).toHaveLength(50);
        expect(new Set(list).size).toBe(50);
        for (const name of list) {
          expect(name).toMatch(/^\p{Script=Latin}+(?:['\- ]\p{Script=Latin}+)*$/u);
          expect(name).not.toContain('ß');
        }
      }
    },
  );

  it('includes accented, apostrophe and hyphen names for the search tokenizer', () => {
    expect(namesByCountry.BR.given).toContain('João');
    expect(namesByCountry.DE.family).toContain('Müller');
    expect(namesByCountry.GB.family).toContain("O'Connor");
    expect(namesByCountry.DE.given).toContain('Anna-Lena');
  });
});
