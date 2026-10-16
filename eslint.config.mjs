import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';
import tseslint from 'typescript-eslint';

/** The `no-restricted-imports` rule for a domain file that may climb at most `maxClimb` levels. */
function domainImportRule(files, maxClimb) {
  return {
    files,
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
              regex: `^(\\.\\./){${maxClimb + 1}}`,
              message: 'The domain imports only its own modules.',
            },
          ],
        },
      ],
    },
  };
}

/**
 * The domain imports only @acme/contract and its own modules. A file `depth` folders below
 * `domain/` may climb at most `depth` levels, so `../` between domain subfolders stays allowed
 * while any path out of `domain/` is rejected. One block per depth up to `maxDepth`, then one
 * catch-all for anything deeper, which may climb at most `maxDepth + 1` levels: that still keeps
 * every deeper file inside `domain/`, at the cost of rejecting some long climbs within it.
 */
function domainImportRules(maxDepth) {
  return [
    ...Array.from({ length: maxDepth + 1 }, (_, depth) =>
      domainImportRule([`api/src/domain/${'*/'.repeat(depth)}*.ts`], depth),
    ),
    domainImportRule([`api/src/domain/${'*/'.repeat(maxDepth + 1)}**/*.ts`], maxDepth + 1),
  ];
}

export default tseslint.config(
  { ignores: ['**/dist/**', '**/coverage/**', 'docs/**', '.claude/**'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: { globals: globals.node },
  },
  {
    files: ['web/src/**/*.{ts,tsx}'],
    ...reactHooks.configs.flat.recommended,
    languageOptions: { globals: globals.browser },
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
  // Every random draw in the seed comes from sfc32 (ADR 0005, *Determinism*).
  {
    files: ['api/src/seed/**/*.ts'],
    rules: {
      'no-restricted-properties': [
        'error',
        {
          object: 'Math',
          property: 'random',
          message: 'Seed code draws only from sfc32 in ./prng, so the data stays deterministic.',
        },
      ],
    },
  },
  prettier,
);
