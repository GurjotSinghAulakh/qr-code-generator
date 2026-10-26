import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import QRCode from 'qrcode';
import { PNG } from 'pngjs';
import { readFile } from 'node:fs/promises';
import { assertDecodedPayload, decodePixels } from '../src/lib/decode';

test('keeps payloads on device and generates after the loaded page goes offline', async ({ page, context }) => {
  const requests: { url: string; body: string | null }[] = [];
  page.on('request', (request) => {
    if (!request.url().startsWith('blob:') && !request.url().startsWith('data:')) requests.push({ url: request.url(), body: request.postData() });
  });
  const response = await page.goto('/');
  expect(response?.headers()['content-security-policy']).toContain("connect-src 'none'");
  expect(response?.headers()['x-content-type-options']).toBe('nosniff');
  expect(response?.headers()['referrer-policy']).toBe('no-referrer');
  await page.getByRole('button', { name: 'Wi-Fi', exact: true }).click();
  await page.getByLabel('Network name (SSID)').fill('PrivateTestNetwork');
  await page.getByLabel('Network password').fill('secret-never-send-8342');
  await expect(page.getByText('Scan check passed')).toBeVisible();
  await context.setOffline(true);
  await page.getByLabel('Network name (SSID)').fill('OfflineTestNetwork');
  await expect(page.getByText('Scan check passed')).toBeVisible();
  await page.getByRole('button', { name: 'Forest green' }).click();
  await expect(page.getByText('Scan check passed')).toBeVisible();
  expect(requests.every(({ url }) => new URL(url).origin === 'http://127.0.0.1:4173')).toBe(true);
  expect(JSON.stringify(requests)).not.toMatch(/PrivateTestNetwork|OfflineTestNetwork|secret-never-send-8342/);
  expect(await page.evaluate(() => ({ local: localStorage.length, session: sessionStorage.length }))).toEqual({ local: 0, session: 0 });
  await context.setOffline(false);
  await page.reload();
  await page.getByRole('button', { name: 'Wi-Fi', exact: true }).click();
  await expect(page.getByLabel('Network password')).toBeEmpty();
});

test('independently verifies a branded export with an embedded local logo', async ({ page }, testInfo) => {
  const logo = new PNG({ width: 64, height: 40 });
  for (let i = 0; i < logo.data.length; i += 4) { logo.data[i] = 24; logo.data[i + 1] = 100; logo.data[i + 2] = 70; logo.data[i + 3] = 255; }
  await page.goto('/');
  const payload = 'https://example.com';
  await page.getByLabel('Website URL').fill(payload);
  await expect(page.getByText('Scan check passed')).toBeVisible();
  await page.getByLabel('Upload logo', { exact: true }).setInputFiles({ name: 'logo.png', mimeType: 'image/png', buffer: PNG.sync.write(logo) });
  await expect(page.getByRole('button', { name: 'Remove logo' })).toBeVisible();
  await expect(page.getByText('Scan check passed')).toBeVisible();
  await page.getByText('Advanced settings', { exact: true }).click();
  await expect(page.getByLabel('Error correction')).toBeDisabled();
  await expect(page.getByRole('combobox', { name: 'Error correction' })).toContainText('H · Highest');
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download PNG' }).click();
  const file = await download;
  const path = testInfo.outputPath('branded.png');
  await file.saveAs(path);
  const png = PNG.sync.read(await readFile(path));
  expect(() => assertDecodedPayload(decodePixels(new Uint8ClampedArray(png.data), png.width, png.height), payload)).not.toThrow();
});

test('exports the latest revision after rapid input changes and preserves contact fields', async ({ page }, testInfo) => {
  await page.goto('/');
  await page.getByLabel('Website URL').fill('https://example.com/old');
  await expect(page.getByRole('button', { name: 'Download PNG' })).toBeEnabled();
  await page.getByLabel('Website URL').fill('https://example.com/intermediate');
  await expect(page.getByRole('button', { name: 'Download PNG' })).toBeDisabled();
  await page.getByLabel('Website URL').fill('https://example.com/latest');
  await expect(page.getByRole('button', { name: 'Download PNG' })).toBeEnabled();
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download PNG' }).click();
  const file = await download;
  const path = testInfo.outputPath('latest.png');
  await file.saveAs(path);
  const png = PNG.sync.read(await readFile(path));
  expect(() => assertDecodedPayload(decodePixels(new Uint8ClampedArray(png.data), png.width, png.height), 'https://example.com/latest')).not.toThrow();
  await page.getByRole('button', { name: 'Contact', exact: true }).click();
  await page.getByLabel('Display name').fill('Alex 日本 🌍');
  await page.getByLabel('First name').fill('Alex');
  await page.getByLabel('Phone number').fill('+47 123 45 678');
  await page.getByLabel('Note', { exact: true }).fill('Hello; friend,\nsecond line');
  await expect(page.getByText('Scan check passed')).toBeVisible();
  await page.getByText('File name & encoded details', { exact: true }).click();
  await expect(page.locator('pre')).toContainText('FN:Alex 日本 🌍');
  await expect(page.locator('pre')).toContainText('TEL:+4712345678');
});

test('requires a crop when two separate QR symbols are present', async ({ page }) => {
  const first = PNG.sync.read(await QRCode.toBuffer('https://example.com/one', { scale: 6 }));
  const second = PNG.sync.read(await QRCode.toBuffer('https://example.com/two', { scale: 6 }));
  const joined = new PNG({ width: first.width + second.width + 40, height: Math.max(first.height, second.height) });
  joined.data.fill(255);
  PNG.bitblt(first, joined, 0, 0, first.width, first.height, 0, 0);
  PNG.bitblt(second, joined, 0, 0, second.width, second.height, first.width + 40, 0);
  await page.goto('/');
  await page.getByRole('button', { name: 'Scan an image' }).click();
  await page.getByLabel('Choose QR image', { exact: true }).setInputFiles({ name: 'two.png', mimeType: 'image/png', buffer: PNG.sync.write(joined) });
  await expect(page.getByRole('alert')).toContainText(/[Cc]rop/);
  await expect(page.getByLabel('Decoded QR content')).toHaveCount(0);
  await page.getByLabel('Choose QR image', { exact: true }).setInputFiles({ name: 'cropped.png', mimeType: 'image/png', buffer: PNG.sync.write(first) });
  await expect(page.getByLabel('Decoded QR content')).toHaveValue('https://example.com/one');
});

test('has no automated AA accessibility violations in the shipped views', async ({ page }, testInfo) => {
  await page.goto('/');
  const check = async (state: string) => {
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
    expect(results.violations.map(({ id, nodes }) => ({ id, nodes: nodes.map(({ target, failureSummary }) => ({ target, failureSummary })) })), state).toEqual([]);
  };
  await check('Empty generator');
  await page.screenshot({ path: testInfo.outputPath('empty-generator.png'), fullPage: true });
  await page.getByLabel('Website URL').fill('https://example.com');
  await expect(page.getByText('Scan check passed')).toBeVisible();
  for (const view of ['Create a code', 'Scan an image', 'Help & privacy']) {
    await page.getByRole('button', { name: view, exact: true }).click();
    if (view === 'Help & privacy') await page.getByText('Does my content leave this device?', { exact: true }).click();
    await check(view);
    await page.screenshot({ path: testInfo.outputPath(`${view.replace(/[^a-z]+/gi, '-').toLowerCase()}.png`), fullPage: true });
  }
  await page.getByRole('button', { name: 'Create a code', exact: true }).click();
  for (const type of ['Wi-Fi', 'Contact']) {
    await page.getByRole('button', { name: type, exact: true }).click();
    await check(`${type} fields`);
  }
});

test('supports the keyboard entry path and 320px reflow', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Skip to main content' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('#main')).toBeFocused();
  await page.getByLabel('Website URL').focus();
  await page.keyboard.type('https://example.com/keyboard');
  await expect(page.getByRole('button', { name: 'Download PNG' })).toBeEnabled();
  await page.getByRole('button', { name: 'Download PNG' }).focus();
  const download = page.waitForEvent('download');
  await page.keyboard.press('Enter');
  await download;
  await expect(page.getByRole('button', { name: 'Download PNG' })).toBeFocused();
  await page.setViewportSize({ width: 320, height: 800 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});
