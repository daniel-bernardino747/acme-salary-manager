import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import globals from 'globals';
import tseslint from 'typescript-eslint';

/**
 * The domain imports only @acme/contract and its own modules. A file `depth` folders below
 * `domain/` may climb at most `depth` levels, so `../` between domain subfolders stays allowed
 * while any path out of `domain/` is rejected. One block per depth, up to `maxDepth`.
 */
function domainImportRules(maxDepth) {
  return Array.from({ length: maxDepth + 1 }, (_, depth) => ({
    files: [`api/src/domain/${'*/'.repeat(depth)}*.ts`],
    ignores: ['**/*.spec.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              regex: '^(?!@acme/contract$|\\.)',
              message: 'The domain imports no package except @acme/contract.',
            },
            {
              regex: `^(\\.\\./){${depth + 1}}`,
              message: 'The domain imports only its own modules.',
            },
          ],
        },
      ],
    },
  }));
}

export default tseslint.config(
  { ignores: ['**/dist/**', '**/coverage/**', 'docs/**', '.claude/**'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: { globals: globals.node },
  },
  // Layer imports in the API (ADR 0002 "Module seams", amended by ADR 0003). Specs may reach test helpers.
  ...domainImportRules(4),
  {
    files: ['api/src/persistence/**/*.ts'],
    ignores: ['**/*.spec.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              regex: '^\\.\\./(?!domain(/|$))',
              message: 'Persistence imports the domain, never the Nest modules.',
            },
            { group: ['@nestjs/*'], message: 'Persistence knows nothing about Nest.' },
          ],
        },
      ],
    },
  },
  prettier,
);
