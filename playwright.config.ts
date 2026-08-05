import { defineConfig, devices } from '@playwright/test';

const isCi = process.env['CI'] === 'true';

export default defineConfig({
  forbidOnly: isCi,
  fullyParallel: true,
  projects: [
    {
      name: 'chromium',
      use: devices['Desktop Chrome'],
    },
  ],
  reporter: [['line'], ['html', { open: 'never' }]],
  retries: isCi ? 2 : 0,
  testDir: './e2e',
  testIgnore: '**/visual.spec.ts',
  use: {
    screenshot: 'only-on-failure',
    trace: 'on-first-retry',
  },
  webServer: [
    {
      command:
        'pnpm build:editor && pnpm --filter @ribbon-ui/editor-demo preview --host 127.0.0.1 --port 4173 --strictPort',
      reuseExistingServer: false,
      timeout: 120_000,
      url: 'http://127.0.0.1:4173',
    },
    {
      command: 'pnpm storybook',
      reuseExistingServer: false,
      timeout: 120_000,
      url: 'http://127.0.0.1:6106',
    },
    {
      command:
        'pnpm exec vite legacy-editor-claude-design-template --host 127.0.0.1 --port 4183 --strictPort',
      reuseExistingServer: false,
      timeout: 120_000,
      url: 'http://127.0.0.1:4183',
    },
  ],
  ...(isCi ? { workers: 1 } : {}),
});
