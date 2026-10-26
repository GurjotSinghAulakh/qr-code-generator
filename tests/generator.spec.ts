import { expect, test } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { PNG } from 'pngjs';
import { assertDecodedPayload, decodePixels } from '../src/lib/decode';

test('creates independently verified PNG and SVG files with the intended URL', async ({ page }, testInfo) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/');
  const payload = 'https://example.com/Mixed/日本?x=%25&x=2#Part';
  await expect(page.getByRole('button', { name: 'Download PNG' })).toBeDisabled();
  await page.getByLabel('Website URL').fill(payload);
  await expect(page.getByText('Scan check passed')).toBeVisible();
  const pngDownload = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download PNG' }).click();
  const png = await pngDownload;
  expect(png.suggestedFilename()).toBe('qr-code.png');
  const pngPath = testInfo.outputPath('qr-code.png');
  await png.saveAs(pngPath);
  const decoded = PNG.sync.read(await readFile(pngPath));
  expect(decoded.width).toBe(1024);
  expect(() => assertDecodedPayload(decodePixels(new Uint8ClampedArray(decoded.data), decoded.width, decoded.height), payload)).not.toThrow();

  const svgDownload = page.waitForEvent('download');
  await page.getByRole('button', { name: 'SVG', exact: true }).click();
  const svg = await svgDownload;
  const svgPath = testInfo.outputPath('qr-code.svg');
  await svg.saveAs(svgPath);
  const markup = await readFile(svgPath, 'utf8');
  expect(markup).toContain('<svg');
  expect(markup).not.toContain('<script');
  expect(markup).not.toContain(payload);
  expect(errors).toEqual([]);
  await page.getByRole('button', { name: 'QR Studio home' }).scrollIntoViewIfNeeded();
  await page.screenshot({ path: testInfo.outputPath('workspace.png'), fullPage: true });
});

test('preserves type drafts and blocks invalid or stale exports', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Website URL').fill('https://example.com/first');
  await expect(page.getByRole('button', { name: 'Download PNG' })).toBeEnabled();
  await page.getByLabel('Website URL').fill('javascript:alert(1)');
  await expect(page.getByRole('button', { name: 'Download PNG' })).toBeDisabled();
  await page.getByRole('button', { name: 'Text', exact: true }).click();
  await page.getByLabel('Your text').fill('  Hello 🌍\n日本語  ');
  await expect(page.getByText('Scan check passed')).toBeVisible();
  await page.getByRole('button', { name: 'Website', exact: true }).click();
  await expect(page.getByLabel('Website URL')).toHaveValue('javascript:alert(1)');
  await page.getByRole('button', { name: 'Clear content' }).click();
  await expect(page.getByLabel('Website URL')).toBeEmpty();
  await expect(page.getByRole('button', { name: 'Download PNG' })).toBeDisabled();
});

test('requires an explicit HTTPS correction and rejects unsafe colors', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Website URL').fill('example.com');
  await expect(page.getByRole('button', { name: 'Download PNG' })).toBeDisabled();
  await page.getByRole('button', { name: 'Use HTTPS for this URL' }).click();
  await expect(page.getByLabel('Website URL')).toHaveValue('https://example.com');
  await expect(page.getByText('Scan check passed')).toBeVisible();
  await page.getByText('Custom colors', { exact: true }).click();
  await page.getByLabel('Code color', { exact: true }).fill('#eeeeee');
  await expect(page.getByRole('button', { name: 'Download PNG' })).toBeDisabled();
  await expect(page.getByRole('alert')).toContainText('4.5:1');
  await page.getByRole('button', { name: 'Reset design' }).click();
  await expect(page.getByText('Scan check passed')).toBeVisible();
});

test('keeps optional controls discoverable and offers downloads before styling on mobile', async ({ page, isMobile }) => {
  await page.goto('/');
  await expect(page.getByLabel('Code color', { exact: true })).toBeHidden();
  await expect(page.getByLabel('Error correction')).toBeHidden();
  await page.getByLabel('Website URL').fill('https://example.com/simple');
  await expect(page.getByRole('button', { name: 'Download PNG' })).toBeEnabled();
  if (isMobile) {
    const download = await page.getByRole('button', { name: 'Download PNG' }).boundingBox();
    const customize = await page.getByRole('heading', { name: 'Make it yours' }).boundingBox();
    expect(download!.y).toBeLessThan(customize!.y);
    await page.getByRole('link', { name: 'Customize colors & logo' }).click();
    await expect(page.getByRole('heading', { name: 'Make it yours' })).toBeInViewport();
  }
  const disclosure = page.getByText('Custom colors', { exact: true });
  await disclosure.focus();
  await disclosure.press('Enter');
  await expect(page.getByLabel('Code color', { exact: true })).toBeVisible();
  await page.getByLabel('Code color', { exact: true }).fill('#18365a');
  await expect(page.getByText('Scan check passed')).toBeVisible();
  if (isMobile) {
    await page.getByRole('link', { name: 'Back to your QR code' }).click();
    await expect(page.getByRole('button', { name: 'Download PNG' })).toBeInViewport();
  }
});
