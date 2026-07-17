import { defineConfig } from '@playwright/test';
import { config as dotenvConfig } from 'dotenv';
import path from 'path';

const ENV = process.env.ENV || 'staging';

const envPath = path.resolve(__dirname, `env/.env.${ENV}`);
console.log('Loading env file:', envPath);
dotenvConfig({ path: envPath });

export const config = {
  env: ENV,
  baseUrl: process.env.BASE_URL || 'https://wl.stg.simplenight.com/',
};

export default defineConfig({
  testDir: './tests',
  workers: parseInt(process.env.WORKERS ?? '1', 10),
  fullyParallel: false,
  retries: parseInt(process.env.RETRIES ?? '1', 10),
  timeout: parseInt(process.env.TIMEOUT ?? '120000', 10),
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report' }],
  ],
  use: {
    baseURL: config.baseUrl,
    viewport: { width: 1920, height: 1080 },
    headless: process.env.HEADLESS === 'true',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  },
  projects: [
    { name: 'Chromium', use: { browserName: 'chromium' } },
  ],
});
