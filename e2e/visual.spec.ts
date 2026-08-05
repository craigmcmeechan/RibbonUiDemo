import { expect, test } from '@playwright/test';

test('Harness fixture matches its reviewed baseline', async ({ page }) => {
  await page.goto('/iframe.html?id=tooling-harness-fixture--default&viewMode=story');

  const story = page.locator('#storybook-root');
  await expect(story.getByRole('heading', { name: 'Verification harness' })).toBeVisible();
  await expect(story).toHaveScreenshot('harness-fixture.png');
});
