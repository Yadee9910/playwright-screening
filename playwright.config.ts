import { defineConfig, devices } from '@playwright/test';

const isCI = !!process.env.CI;

export default defineConfig({
  testDir: './tests',
  // Every test gets its own browser context, so tests can safely run in parallel.
  fullyParallel: true,
  // Fail the CI build if someone accidentally commits test.only.
  forbidOnly: isCI,
  // Retries only on CI. Locally a failure should fail straight away.
  retries: isCI ? 2 : 0,
  workers: isCI ? 2 : undefined,
  reporter: [['html', { open: 'never' }], ['list']],
  use: {
    // Default site is the TodoMVC demo. Docs tests override this with test.use().
    baseURL: 'https://demo.playwright.dev/todomvc/',
    // Record a trace only when a test is retried, so we get debug info without slowing every run.
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
  ],
});
