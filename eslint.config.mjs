import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTypescript from 'eslint-config-next/typescript'
import prettier from 'eslint-config-prettier/flat'
import prettierPlugin from 'eslint-plugin-prettier'
import jest from 'eslint-plugin-jest'
import jsdoc from 'eslint-plugin-jsdoc'

export default defineConfig([
  ...nextVitals,
  ...nextTypescript,
  prettier,
  globalIgnores(['.next/**', 'coverage/**', 'public/**']),
  {
    plugins: { prettier: prettierPlugin },
    rules: {
      'prettier/prettier': ['error', { semi: false, singleQuote: true }],
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
  },
  {
    files: ['app/**/test.tsx'],
    plugins: { jest },
    languageOptions: { globals: jest.environments.globals.globals },
  },
  {
    files: ['app/api/**/*.ts'],
    plugins: { jsdoc },
    rules: {
      'jsdoc/no-missing-syntax': [
        'error',
        {
          contexts: [
            {
              comment: 'JsdocBlock:has(JsdocTag[tag=swagger])',
              context: 'any',
              message: '@swagger documentation is required on each API.',
            },
          ],
        },
      ],
    },
  },
])
