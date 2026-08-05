import { expect, test } from '@playwright/test';

import { openLegacyEditor } from './support/legacy-editor';

test('Harness fixture matches its reviewed baseline', async ({ page }) => {
  await page.goto('/iframe.html?id=tooling-harness-fixture--default&viewMode=story');

  const story = page.locator('#storybook-root');
  await expect(story.getByRole('heading', { name: 'Verification harness' })).toBeVisible();
  await expect(story).toHaveScreenshot('harness-fixture.png');
});

for (const theme of [
  {
    id: 'foundation-theme-provider--modern-light',
    label: 'modern-light',
    snapshot: 'theme-provider-modern-light.png',
  },
  {
    id: 'foundation-theme-provider--classic-light',
    label: 'classic-light',
    snapshot: 'theme-provider-classic-light.png',
  },
  {
    id: 'foundation-theme-provider--modern-dark',
    label: 'modern-dark',
    snapshot: 'theme-provider-modern-dark.png',
  },
] as const) {
  test(`Theme provider ${theme.label} contract matches its reviewed baseline`, async ({ page }) => {
    await page.goto(`/iframe.html?id=${theme.id}&viewMode=story`);

    const boundary = page.locator('.ribbon-ui-theme');
    await expect(boundary).toHaveAttribute('data-ribbon-ui-theme', theme.label);
    await expect(boundary.getByRole('status')).toContainText(`Active theme: ${theme.label}`);
    await expect(boundary).toHaveScreenshot(theme.snapshot);
  });
}

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
