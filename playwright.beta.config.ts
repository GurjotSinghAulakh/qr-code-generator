import { defineConfig, devices } from '@playwright/test';
import base from './playwright.config';

export default defineConfig({
  ...base,
  testDir: '.',
  testMatch: ['tests/**/*.spec.ts', 'beta-tests/**/*.spec.ts'],
  outputDir: 'beta-results/artifacts',
  workers: 2,
  retries: 0,
  reporter: [['list'], ['json', { outputFile: 'beta-results/results.json' }]],
  projects: [
    { name: 'chrome-installed', use: { ...devices['Desktop Chrome'], userAgent: undefined, channel: 'chrome' } },
    { name: 'firefox-engine', use: { ...devices['Desktop Firefox'], userAgent: undefined } },
    { name: 'webkit-engine', use: { ...devices['Desktop Safari'], userAgent: undefined } },
    { name: 'iphone-webkit-emulated', use: { ...devices['iPhone 13'] } },
  ],
});
