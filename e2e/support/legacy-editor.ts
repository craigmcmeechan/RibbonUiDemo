import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';

const LEGACY_EDITOR_URL = 'http://127.0.0.1:4183';
const LOCAL_HOST_PATTERN = /^https?:\/\/127\.0\.0\.1(?::\d+)?(?:\/|$)/u;
const LEGACY_DEPENDENCY_PATHS = [
  '/vendor/react.development.js',
  '/vendor/react-dom.development.js',
  '/vendor/babel.min.js',
];

export async function openLegacyEditor(page: Page) {
  const pageErrors: string[] = [];
  const loadedDependencies = new Set<string>();
  page.on('pageerror', (error) => {
    pageErrors.push(error.message);
  });
  page.on('response', (response) => {
    const url = new URL(response.url());
    if (LEGACY_DEPENDENCY_PATHS.includes(url.pathname) && response.ok()) {
      loadedDependencies.add(url.pathname);
    }
  });

  await page.route(/^https?:\/\//u, async (route) => {
    if (LOCAL_HOST_PATTERN.test(route.request().url())) {
      await route.continue();
      return;
    }

    await route.abort('blockedbyclient');
  });

  await page.goto(LEGACY_EDITOR_URL);
  await expect(page.locator('.editor-app')).toBeVisible();
  expect([...loadedDependencies].sort()).toEqual([...LEGACY_DEPENDENCY_PATHS].sort());
  await expect
    .poll(() =>
      page.evaluate(() => {
        const runtime = globalThis as typeof globalThis & {
          Babel?: unknown;
          React?: unknown;
          ReactDOM?: unknown;
        };

        return [typeof runtime.React, typeof runtime.ReactDOM, typeof runtime.Babel];
      }),
    )
    .toEqual(['object', 'object', 'object']);
  expect(pageErrors).toEqual([]);
}
