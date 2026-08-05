import { defineConfig, devices } from '@playwright/test';

const isCi = process.env['CI'] === 'true';

export default defineConfig({
  expect: {
    toHaveScreenshot: {
      animations: 'disabled',
      maxDiffPixelRatio: 0.01,
    },
  },
  forbidOnly: isCi,
  projects: [
    {
      name: 'visual-chromium',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { height: 600, width: 800 },
      },
    },
  ],
  reporter: [['line'], ['html', { open: 'never' }]],
  retries: isCi ? 1 : 0,
  testDir: './e2e',
  testMatch: '**/visual.spec.ts',
  use: {
    baseURL: 'http://127.0.0.1:6106',
    screenshot: 'only-on-failure',
    trace: 'on-first-retry',
  },
  webServer: [
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
  workers: 1,
});
