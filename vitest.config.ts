import { playwright } from '@vitest/browser-playwright';
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

const repositoryRoot = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  test: {
    coverage: {
      exclude: ['**/index.ts', '**/*.stories.tsx', '**/*.test.{ts,tsx}'],
      include: [
        'packages/ui/src/schema/**/*.ts',
        'packages/ui/src/theme/**/*.{ts,tsx}',
        'test/harness/HarnessFixture.tsx',
      ],
      provider: 'v8',
      reporter: ['text', 'json-summary', 'html'],
      reportsDirectory: 'coverage',
      thresholds: {
        branches: 80,
        functions: 80,
        lines: 80,
        statements: 80,
      },
    },
    projects: [
      {
        extends: true,
        test: {
          environment: 'jsdom',
          include: ['packages/ui/src/**/*.test.{ts,tsx}', 'test/**/*.test.{ts,tsx}'],
          name: 'unit',
          setupFiles: ['./vitest.setup.ts'],
        },
      },
      {
        extends: true,
        plugins: [
          storybookTest({
            configDir: path.join(repositoryRoot, '.storybook'),
            storybookScript: 'pnpm storybook',
          }),
        ],
        test: {
          browser: {
            enabled: true,
            headless: true,
            instances: [{ browser: 'chromium' }],
            provider: playwright({}),
          },
          name: 'storybook',
          setupFiles: ['./.storybook/vitest.setup.ts'],
        },
      },
    ],
  },
});
