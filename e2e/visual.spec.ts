import { expect, test } from '@playwright/test';

import { openLegacyEditor } from './support/legacy-editor';

test('Harness fixture matches its reviewed baseline', async ({ page }) => {
  await page.goto('/iframe.html?id=tooling-harness-fixture--default&viewMode=story');

  const story = page.locator('#storybook-root');
  await expect(story.getByRole('heading', { name: 'Verification harness' })).toBeVisible();
  await expect(story).toHaveScreenshot('harness-fixture.png');
});

test('Legacy editor light shell matches its migration baseline', async ({ page }) => {
  await openLegacyEditor(page);

  await expect(page.locator('.editor-app')).toHaveScreenshot('legacy-editor-light.png');
});

test('Legacy editor dark shell matches its migration baseline', async ({ page }) => {
  await openLegacyEditor(page);
  await page.getByRole('button', { name: 'View', exact: true }).click();
  await page.getByTitle('Interface Theme').click();
  await page
    .locator('.menu-item')
    .filter({ hasText: /^Dark$/ })
    .click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'modern-dark');
  await page.getByRole('button', { name: 'Home', exact: true }).click();

  await expect(page.locator('.editor-app')).toHaveScreenshot('legacy-editor-dark.png');
});
