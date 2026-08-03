import { defineConfig, devices } from '@playwright/test';

// E2E + accessibility harness (spec §9). The axe a11y suite runs against the
// built static site served by scripts/serve-dist.mjs, across the required
// viewport matrix (375 / 768 / 1440). reuseExistingServer keeps local reruns
// fast; in CI the webServer builds + serves from scratch.
const PORT = Number(process.env.A11Y_PORT ?? 41411);
const BASE_URL = `http://127.0.0.1:${PORT}`;

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: 'list',
  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
  },
  webServer: {
    command: 'node scripts/serve-dist.mjs',
    url: `${BASE_URL}/`,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
    stdout: 'pipe',
    stderr: 'pipe',
  },
  projects: [
    { name: 'mobile-375', use: { ...devices['Desktop Chrome'], viewport: { width: 375, height: 812 } } },
    { name: 'tablet-768', use: { ...devices['Desktop Chrome'], viewport: { width: 768, height: 1024 } } },
    { name: 'desktop-1440', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } } },
  ],
});
