import js from '@eslint/js'
import reactHooks from 'eslint-plugin-react-hooks'
import globals from 'globals'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  { ignores: ['.next', 'node_modules', 'out', 'next-env.d.ts'] },

  // Type-aware rules are deliberately NOT enabled, matching the companion repo. See
  // docs/05-DEPENDENCIES.md for the typescript-eslint peer-range constraint.
  {
    files: ['**/*.{ts,tsx}'],
    extends: [js.configs.recommended, ...tseslint.configs.recommended, reactHooks.configs.flat['recommended-latest']],
    languageOptions: {
      ecmaVersion: 2023,
      globals: { ...globals.browser, ...globals.node },
    },
    rules: {
      // Matches the reference codebase: dependency arrays are verified by hand.
      'react-hooks/exhaustive-deps': 'off',
      'prefer-const': 'error',
      camelcase: 'error',
      'no-console': ['error', { allow: ['warn', 'error'] }],
      '@typescript-eslint/consistent-type-definitions': ['error', 'type'],
      '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }],
      '@typescript-eslint/no-explicit-any': 'error',
    },
  },

  /* Test files may print. The perf test's whole output IS the measurement, and
     `no-console` is there to keep debug logging out of product code, not out of a
     reporter. */
  {
    files: ['**/*.test.ts', '**/*.test.tsx'],
    rules: { 'no-console': 'off' },
  },

  /* RULE: the DataTable must stay provably domain-free and portable. It is the graded
     component, and the whole claim is that it knows nothing about classes, payouts or
     the gym. This makes that claim enforceable rather than aspirational. */
  {
    files: ['src/components/DataTable/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['**/components/pages/*', 'components/pages/*', '**/services/*', 'services/*', '**/pages/*', 'next/*', '**/server/*', 'server/*'],
              message: 'DataTable must stay domain-free and portable: no page modules, services, pages, server or Next imports.',
            },
          ],
        },
      ],
    },
  },

  /* RULE: the mock database is server-only. Importing it from a component would ship
     the 5k-row dataset (and faker) to the browser. */
  {
    files: ['src/**/*.{ts,tsx}'],
    ignores: ['src/pages/api/**', 'src/server/**'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['**/server/mock/*', 'server/mock/*', '@faker-js/faker'],
              message: 'server/mock is server-only: import it from src/pages/api/** only.',
            },
          ],
        },
      ],
    },
  },

  /* RULE: raw fetch belongs to the API layer alone. */
  {
    files: ['src/components/**/*.{ts,tsx}', 'src/hooks/**/*.{ts,tsx}', 'src/layouts/**/*.{ts,tsx}', 'src/utils/**/*.{ts,tsx}', 'src/pages/**/*.tsx'],
    rules: {
      'no-restricted-globals': [
        'error',
        { name: 'fetch', message: 'Raw fetch lives only in services/api/apiClient.ts. Use a service function.' },
        { name: 'localStorage', message: 'Wrap storage in a storage module; never touch it from a component or hook.' },
        { name: 'sessionStorage', message: 'Wrap storage in a storage module; never touch it from a component or hook.' },
      ],
    },
  },
)
