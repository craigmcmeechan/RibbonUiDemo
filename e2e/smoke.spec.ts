import { expect, test } from '@playwright/test';

test('Editor workspace bundle renders', async ({ page }) => {
  await page.goto('http://127.0.0.1:4173');

  await expect(page).toHaveTitle('RibbonUI Editor');
  await expect(page.getByRole('heading', { name: 'RibbonUI Editor workspace' })).toBeVisible();
});

test('Storybook harness story renders and interacts', async ({ page }) => {
  await page.goto(
    'http://127.0.0.1:6106/iframe.html?id=tooling-harness-fixture--default&viewMode=story',
  );

  const button = page.getByRole('button', { name: 'Deactivate harness' });
  await expect(button).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByRole('status')).toHaveText('Harness is active.');
  await button.click();
  await expect(page.getByRole('status')).toHaveText('Harness is inactive.');
});
