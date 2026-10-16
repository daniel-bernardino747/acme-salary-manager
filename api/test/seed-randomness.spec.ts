import path from 'node:path';
import { ESLint } from 'eslint';
import { describe, expect, it } from 'vitest';

// ADR 0005, *Determinism*: no `Math.random` in seed code.
const repoRoot = path.resolve(__dirname, '..', '..');
const eslint = new ESLint({ cwd: repoRoot });

async function restrictedProperties(file: string): Promise<number> {
  const [result] = await eslint.lintText('export const draw = Math.random();\n', {
    filePath: path.join(repoRoot, 'api', 'src', file),
  });
  return result?.messages.filter((m) => m.ruleId === 'no-restricted-properties').length ?? 0;
}

describe('seed randomness', () => {
  it.each(['seed/generate-employees.ts', 'seed/deep/draw.ts', 'seed/prng.spec.ts'])(
    '%s may not call Math.random',
    async (file) => {
      expect(await restrictedProperties(file)).toBe(1);
    },
  );

  it('code outside the seed may', async () => {
    expect(await restrictedProperties('health/health.controller.ts')).toBe(0);
  });
});
