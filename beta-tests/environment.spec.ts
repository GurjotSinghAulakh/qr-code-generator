import { test, expect } from '@playwright/test';
import os from 'node:os';
import { execFileSync } from 'node:child_process';

test('records the actual browser runtime and host without equating emulation to hardware', async ({ page, browser, browserName, isMobile }, testInfo) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Sharing, made simple.' })).toBeVisible();
  const environment = {
    project: testInfo.project.name,
    browserName,
    browserVersion: browser.version(),
    userAgent: await page.evaluate(() => navigator.userAgent),
    viewport: page.viewportSize(),
    mobileEmulation: !!isMobile,
    physicalPhone: false,
    runtimeClassification: testInfo.project.name === 'chrome-installed' ? 'Installed Google Chrome, isolated automated session' : 'Playwright test runtime',
    host: {
      platform: os.platform(),
      version: os.platform() === 'darwin' ? execFileSync('sw_vers', ['-productVersion'], { encoding: 'utf8' }).trim() : os.release(),
      architecture: os.arch(),
      cpu: os.cpus()[0]?.model ?? 'not available',
      ramGiB: Math.round(os.totalmem() / 1024 ** 3),
    },
    limitations: 'No screen reader, physical phone, print, or native camera result is established by this automated run. WebKit is not the Safari application.',
  };
  await testInfo.attach('environment', { body: JSON.stringify(environment, null, 2), contentType: 'application/json' });
});
