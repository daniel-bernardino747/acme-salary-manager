import { describe, expect, it } from 'vitest';
import { generateEmployees } from './generate-employees';
import { generatorGoldenHash } from './golden-hash';

// Committed golden hashes (ADR 0005, *Tests*). A change to any weight, anchor, multiplier, plant or
// name list changes them on purpose: update them in the same commit, so the diff shows it.
const GENERATOR_GOLDEN_HASH = '';

describe('generatorGoldenHash', () => {
  it("matches the committed hash for the generator's output", () => {
    expect(generatorGoldenHash(generateEmployees().map((g) => g.employee))).toBe(
      GENERATOR_GOLDEN_HASH,
    );
  });
});
