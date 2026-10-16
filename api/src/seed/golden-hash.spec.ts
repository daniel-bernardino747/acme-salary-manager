import { describe, expect, it } from 'vitest';
import { generateEmployees } from './generate-employees';
import { generatorGoldenHash } from './golden-hash';

// Committed golden hashes (ADR 0005, *Tests*). A change to any weight, anchor, multiplier, plant or
// name list changes them on purpose: update them in the same commit, so the diff shows it.
const GENERATOR_GOLDEN_HASH = '4289032df6b1b718702372acce418856ef09481497d89d8785b39b2e534e405b';

describe('generatorGoldenHash', () => {
  it("matches the committed hash for the generator's output", () => {
    expect(generatorGoldenHash(generateEmployees().map((g) => g.employee))).toBe(
      GENERATOR_GOLDEN_HASH,
    );
  });
});
