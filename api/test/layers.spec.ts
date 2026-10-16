import path from 'node:path';
import { ESLint } from 'eslint';
import { describe, expect, it } from 'vitest';

// ADR 0002 "Module seams", as amended by ADR 0003: domain → contract only; persistence → domain;
// Nest modules → both.
const repoRoot = path.resolve(__dirname, '..', '..');
const eslint = new ESLint({ cwd: repoRoot });

async function restrictedImports(file: string, specifier: string): Promise<number> {
  const [result] = await eslint.lintText(`import '${specifier}';\n`, {
    filePath: path.join(repoRoot, 'api', 'src', file),
  });
  return result?.messages.filter((m) => m.ruleId === 'no-restricted-imports').length ?? 0;
}

describe('layer imports', () => {
  it.each([
    ['domain/money.ts', '../persistence/db'],
    ['domain/money.ts', '../health/health.controller'],
    ['domain/money.ts', '@nestjs/common'],
    ['domain/money.ts', 'drizzle-orm'],
    ['domain/stats/median.ts', '../../persistence/db'],
    ['domain/stats/median.ts', '../../app.module'],
    ['domain/money.ts', 'node:fs'],
    // Deeper than the per-depth blocks reach.
    ['domain/a/b/c/d/e/deep.ts', 'drizzle-orm'],
    ['domain/a/b/c/d/e/deep.ts', '../../../../../../persistence/db'],
    ['persistence/employees.ts', '../health/health.controller'],
    ['persistence/employees.ts', '../app.module'],
    ['persistence/employees.ts', '@nestjs/common'],
  ])('%s may not import %s', async (file, specifier) => {
    expect(await restrictedImports(file, specifier)).toBe(1);
  });

  it.each([
    ['domain/money.ts', '@acme/contract'],
    ['domain/money.ts', './rounding'],
    ['domain/stats/median.ts', '../money'],
    ['domain/stats/median.ts', './rounding'],
    ['domain/a/b/c/d/e/deep.ts', '@acme/contract'],
    ['domain/a/b/c/d/e/deep.ts', '../sibling'],
    ['persistence/employees.ts', '../domain/money'],
    ['persistence/employees.ts', './schema'],
    ['persistence/employees.ts', 'drizzle-orm'],
    ['health/health.controller.ts', '../persistence/db'],
    ['health/health.controller.ts', '../domain/money'],
  ])('%s may import %s', async (file, specifier) => {
    expect(await restrictedImports(file, specifier)).toBe(0);
  });
});
