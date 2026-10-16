import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['**/dist/**', '**/coverage/**', 'docs/**', '.claude/**'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: { globals: globals.node },
  },
  // Layer imports in the API (ADR 0002 "Module seams", amended by ADR 0003). Specs may reach test helpers.
  {
    files: ['api/src/domain/**/*.ts'],
    ignores: ['**/*.spec.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              regex: '^(?!@acme/contract$|\\./)',
              message: 'The domain imports only @acme/contract and its own modules.',
            },
          ],
        },
      ],
    },
  },
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
