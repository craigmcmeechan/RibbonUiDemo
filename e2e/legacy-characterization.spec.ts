import { expect, test } from '@playwright/test';

import { openLegacyEditor } from './support/legacy-editor';

test.beforeEach(async ({ page }) => {
  await openLegacyEditor(page);
});

test('loads the source-defined default shell and status', async ({ page }) => {
  await expect(page).toHaveTitle(/Ribbon Editor/);
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'modern-light');
  await expect(page.locator('.ribbon-tab.active')).toHaveText('Home');
  await expect(page.locator('.left-panel')).toContainText('Find and replace');
  await expect(page.locator('.right-panel')).toContainText('Line spacing');
  await expect(page.locator('.statusbar')).toContainText('Page 1 of 1');
  await expect(page.locator('.statusbar .sb-btn').filter({ hasText: /\d+ words/ })).not.toHaveText(
    '0 words',
  );
});

test('persists the selected interface theme', async ({ page }) => {
  await page.getByRole('button', { name: 'View', exact: true }).click();
  await page.getByTitle('Interface Theme').click();
  await page
    .locator('.menu-item')
    .filter({ hasText: /^Dark$/ })
    .click();

  await expect(page.locator('html')).toHaveAttribute('data-theme', 'modern-dark');
  await expect
    .poll(() => page.evaluate(() => localStorage.getItem('de_theme')))
    .toBe('modern-dark');

  await page.reload();
  await expect(page.locator('.editor-app')).toBeVisible();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'modern-dark');
});

test('keeps the selected ribbon tab while side panels change', async ({ page }) => {
  await page.getByRole('button', { name: 'Insert', exact: true }).click();
  await expect(page.locator('.ribbon-tab.active')).toHaveText('Insert');

  await page.getByTitle('Find & Replace').click();
  await expect(page.locator('.left-panel')).toBeHidden();
  await page.getByTitle('Comments').click();
  await expect(page.locator('.left-panel')).toContainText('Comments');

  await page.getByTitle('Paragraph settings').click();
  await expect(page.locator('.right-panel')).toBeHidden();
  await page.getByTitle('Table settings').click();
  await expect(page.locator('.right-panel')).toContainText('Table - Advanced Settings');
  await expect(page.locator('.ribbon-tab.active')).toHaveText('Insert');
});

test('preserves a document selection when a ribbon command is used', async ({ page }) => {
  const editor = page.locator('.doc-page');
  const selectedText = await editor.evaluate((element) => {
    const heading = element.querySelector('h1');
    const text = heading?.firstChild;

    if (text === null || text === undefined) {
      throw new Error('Legacy heading text was not found.');
    }

    const range = document.createRange();
    range.selectNodeContents(text);
    const selection = window.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(range);
    return selection?.toString();
  });

  expect(selectedText).toBe('Project Brief');
  await page.getByTitle('Bold (Ctrl+B)').click();
  await expect
    .poll(() => page.evaluate(() => window.getSelection()?.toString()))
    .toBe('Project Brief');
});

test('updates the word count after contenteditable input', async ({ page }) => {
  const count = page.locator('.statusbar .sb-btn').filter({ hasText: /\d+ words/ });
  const before = Number.parseInt((await count.textContent()) ?? '', 10);
  expect(before).toBeGreaterThan(0);

  const editor = page.locator('.doc-page');
  await expect(editor).toHaveAttribute('contenteditable', 'true');
  await editor.click();
  await page.keyboard.press('Control+End');
  await page.keyboard.type(' paritytoken');

  await expect(count).toHaveText(`${String(before + 1)} words`);
});

test('clamps status-bar zoom controls to the source-defined range', async ({ page }) => {
  const zoom = page.locator('.sb-zoom');
  const slider = zoom.locator('input[type="range"]');

  await slider.fill('200');
  await expect(zoom.locator('.sb-zoom-val')).toHaveText('200%');
  await zoom.getByRole('button', { name: '+' }).click();
  await expect(zoom.locator('.sb-zoom-val')).toHaveText('200%');

  await slider.fill('50');
  await expect(zoom.locator('.sb-zoom-val')).toHaveText('50%');
  await zoom.getByRole('button', { name: '−' }).click();
  await expect(zoom.locator('.sb-zoom-val')).toHaveText('50%');
});

test('opens and closes Backstage without changing the active ribbon tab', async ({ page }) => {
  await page.getByRole('button', { name: 'File', exact: true }).click();
  await expect(page.locator('.backstage')).toBeVisible();
  await expect(page.locator('.bs-main')).toContainText('Document Info');
  await page
    .locator('.bs-item')
    .filter({ hasText: /^Settings$/ })
    .click();
  await expect(page.locator('.bs-main').getByRole('heading')).toHaveText('Settings');
  await page.getByRole('button', { name: 'Return to document' }).click();

  await expect(page.locator('.backstage')).toBeHidden();
  await expect(page.locator('.ribbon-tab.active')).toHaveText('Home');
});

test('opens and closes the share and plugin overlays', async ({ page }) => {
  await page.locator('.ribbon-tabs-right').getByRole('button', { name: 'Share' }).click();
  const shareTitle = page.getByText('Sharing Settings', { exact: true });
  await expect(shareTitle).toBeVisible();
  await shareTitle.locator('..').getByRole('button').click();
  await expect(shareTitle).toBeHidden();

  await page.getByRole('button', { name: 'Plugins', exact: true }).click();
  await page.getByTitle('Plugin Manager').click();
  const pluginTitle = page.getByText('Plugin Manager', { exact: true }).last();
  await expect(pluginTitle).toBeVisible();
  await pluginTitle.locator('..').getByRole('button').click();
  await expect(pluginTitle).toBeHidden();
});

test('opens the search panel with the source-defined keyboard shortcut', async ({ page }) => {
  await page.getByTitle('Find & Replace').click();
  await expect(page.locator('.left-panel')).toBeHidden();

  await page.keyboard.press('Control+f');

  await expect(page.locator('.left-panel')).toContainText('Find and replace');
  await expect(page.locator('input[placeholder="Find"]')).not.toBeFocused();
});
