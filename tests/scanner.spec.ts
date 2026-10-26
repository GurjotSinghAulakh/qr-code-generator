import { expect, test } from '@playwright/test';
import QRCode from 'qrcode';

async function fixture(text: string) {
  return { name: 'code.png', mimeType: 'image/png', buffer: await QRCode.toBuffer(text, { errorCorrectionLevel: 'M', scale: 8, margin: 4 }) };
}

test('decodes an image locally and confirms before replacing an existing draft', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Website URL').fill('https://example.com/original');
  await page.getByRole('button', { name: 'Scan an image' }).click();
  const payload = 'https://example.com/scanned?x=%25#日本';
  await page.getByLabel('Choose QR image', { exact: true }).setInputFiles(await fixture(payload));
  await expect(page.getByText('Decoded successfully · Website')).toBeVisible();
  await expect(page.getByLabel('Decoded QR content')).toHaveValue(payload);
  await expect(page.getByRole('link', { name: 'Open the displayed website' })).toHaveAttribute('href', payload);
  page.once('dialog', (dialog) => dialog.dismiss());
  await page.getByRole('button', { name: 'Load into editor' }).click();
  await expect(page.getByLabel('Decoded QR content')).toHaveValue(payload);
  page.once('dialog', (dialog) => dialog.accept());
  await page.getByRole('button', { name: 'Load into editor' }).click();
  await expect(page.getByLabel('Website URL')).toHaveValue(payload);
  await expect(page.getByText('Scan check passed')).toBeVisible();
});

test('shows malicious content as text and never offers unsafe navigation', async ({ page }) => {
  const dialogs: string[] = [];
  page.on('dialog', (dialog) => { dialogs.push(dialog.message()); void dialog.dismiss(); });
  await page.goto('/');
  await page.getByRole('button', { name: 'Scan an image' }).click();
  const text = 'javascript:alert(1)<img src=x onerror=alert(2)>';
  await page.getByLabel('Choose QR image', { exact: true }).setInputFiles(await fixture(text));
  await expect(page.getByLabel('Decoded QR content')).toHaveValue(text);
  await expect(page.getByRole('link', { name: 'Open the displayed website' })).toHaveCount(0);
  await page.getByRole('button', { name: 'Load into editor' }).click();
  await expect(page.getByLabel('Your text')).toHaveValue(text);
  expect(dialogs).toEqual([]);
});

test('protects Wi-Fi details and preserves credentials on editor handoff', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Scan an image' }).click();
  const text = 'WIFI:T:WPA;S:Café\\;Guest;P:password123;H:true;;';
  await page.getByLabel('Choose QR image', { exact: true }).setInputFiles(await fixture(text));
  await expect(page.getByText('Decoded successfully · Wi-Fi')).toBeVisible();
  await expect(page.getByLabel('Decoded QR content')).toHaveCount(0);
  await page.getByRole('button', { name: 'Reveal decoded Wi-Fi content' }).click();
  await expect(page.getByLabel('Decoded QR content')).toHaveValue(text);
  await page.getByRole('button', { name: 'Load into editor' }).click();
  await expect(page.getByLabel('Network name (SSID)')).toHaveValue('Café;Guest');
  await expect(page.getByLabel('Network password')).toHaveValue('password123');
  await expect(page.getByLabel('Network password')).toHaveAttribute('type', 'password');
  await expect(page.getByText('Scan check passed')).toBeVisible();
});

test('rejects unsupported images and oversized dimensions before rasterization', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Scan an image' }).click();
  await page.getByLabel('Choose QR image', { exact: true }).setInputFiles({ name: 'fake.png', mimeType: 'image/png', buffer: Buffer.from('<svg onload="alert(1)"/>') });
  await expect(page.getByRole('alert')).toContainText('valid PNG, JPEG, or WebP');
  const dimensions = Buffer.alloc(24);
  Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]).copy(dimensions);
  dimensions.write('IHDR', 12); dimensions.writeUInt32BE(5000, 16); dimensions.writeUInt32BE(5000, 20);
  await page.getByLabel('Choose QR image', { exact: true }).setInputFiles({ name: 'huge.png', mimeType: 'image/png', buffer: dimensions });
  await expect(page.getByRole('alert')).toContainText('24-megapixel');
});
