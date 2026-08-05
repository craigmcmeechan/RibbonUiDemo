import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';
import { fileURLToPath } from 'node:url';

const LEGACY_EDITOR_URL = 'http://127.0.0.1:4183';

const legacyDependencies = new Map([
  [
    'https://unpkg.com/react@18.3.1/umd/react.development.js',
    fileURLToPath(
      new URL('../../node_modules/legacy-react/umd/react.development.js', import.meta.url),
    ),
  ],
  [
    'https://unpkg.com/react-dom@18.3.1/umd/react-dom.development.js',
    fileURLToPath(
      new URL('../../node_modules/legacy-react-dom/umd/react-dom.development.js', import.meta.url),
    ),
  ],
  [
    'https://unpkg.com/@babel/standalone@7.29.0/babel.min.js',
    fileURLToPath(new URL('../../node_modules/@babel/standalone/babel.min.js', import.meta.url)),
  ],
]);

export async function openLegacyEditor(page: Page) {
  const pageErrors: string[] = [];
  page.on('pageerror', (error) => {
    pageErrors.push(error.message);
  });

  await page.route('https://unpkg.com/**', async (route) => {
    const dependencyPath = legacyDependencies.get(route.request().url());

    if (dependencyPath === undefined) {
      await route.abort('blockedbyclient');
      return;
    }

    await route.fulfill({
      contentType: 'application/javascript; charset=utf-8',
      path: dependencyPath,
    });
  });

  await page.goto(LEGACY_EDITOR_URL);
  await expect(page.locator('.editor-app')).toBeVisible();
  expect(pageErrors).toEqual([]);
}
