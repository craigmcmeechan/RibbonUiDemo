import eslint from '@eslint/js';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import globals from 'globals';
import tseslint from 'typescript-eslint';

const typedSourceFiles = ['apps/*/src/**/*.{ts,tsx}', 'packages/*/src/**/*.{ts,tsx}'];
const colocatedTestFiles = ['packages/*/src/**/*.test.{ts,tsx}'];
const typescriptConfigFiles = ['apps/*/*.config.ts', 'packages/*/*.config.ts'];
const testAndToolingFiles = [
  '.storybook/**/*.ts',
  'e2e/**/*.ts',
  'packages/*/src/**/*.test.{ts,tsx}',
  'scripts/**/*.ts',
  'test/**/*.{ts,tsx}',
  '*.config.ts',
  'vitest.setup.ts',
];

const scopedConfigs = (configs, files, ignores = []) =>
  configs.map((config) => ({ ...config, files, ignores }));

export default tseslint.config(
  {
    ignores: [
      'legacy-editor-claude-design-template/**',
      'node_modules/**',
      '**/node_modules/**',
      '**/dist/**',
      '**/coverage/**',
      '**/storybook-static/**',
      '**/playwright-report/**',
      '**/test-results/**',
      '**/*.schema.types.ts',
      '**/*.d.ts',
      '**/*.tsbuildinfo',
      '**/__snapshots__/**',
      '**/visual-baselines/**',
    ],
  },
  eslint.configs.recommended,
  {
    files: ['**/*.{js,mjs,cjs}'],
    languageOptions: {
      globals: globals.node,
    },
  },
  ...scopedConfigs(tseslint.configs.strictTypeChecked, typedSourceFiles, colocatedTestFiles),
  ...scopedConfigs(tseslint.configs.strictTypeChecked, testAndToolingFiles),
  {
    files: typedSourceFiles,
    ignores: colocatedTestFiles,
    languageOptions: {
      globals: globals.browser,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      'react-hooks': reactHooks,
    },
    rules: {
      ...reactHooks.configs.flat.recommended.rules,
    },
  },
  {
    files: testAndToolingFiles,
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
      parserOptions: {
        project: './tsconfig.test.json',
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    files: ['apps/*/src/**/*.tsx'],
    plugins: {
      'react-refresh': reactRefresh,
    },
    rules: {
      'react-refresh/only-export-components': ['error', { allowConstantExport: true }],
    },
  },
  ...scopedConfigs(tseslint.configs.recommended, typescriptConfigFiles),
  {
    files: typescriptConfigFiles,
    languageOptions: {
      globals: globals.node,
    },
  },
);
