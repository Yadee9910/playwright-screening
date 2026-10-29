import { test, expect } from '../../fixtures';

test.use({ baseURL: 'https://playwright.dev' });

test.describe('playwright.dev', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('home page title contains "Playwright"', async ({ page }) => {
    await expect(page).toHaveTitle(/Playwright/);
  });

  test('"Get started" opens the Installation page', async ({ page }) => {
    await page.getByRole('link', { name: 'Get started' }).click();

    await expect(page).toHaveURL(/\/docs\/intro/);
    await expect(
      page.getByRole('heading', { name: 'Installation', exact: true, level: 1 }),
    ).toBeVisible();
  });

  test('site search finds results for "locators"', async ({ page }) => {
    await page.getByRole('button', { name: 'Search' }).click();
    await page.getByPlaceholder('Search docs').fill('locators');

    await expect(
      page.getByRole('option').filter({ hasText: /locator/i }).first(),
    ).toBeVisible();
  });

  test('page still renders when all images are blocked (page.route)', async ({ page }) => {
    const blocked: string[] = [];
    await page.route('**/*.{png,jpg,jpeg,gif,svg,webp,avif}', async (route) => {
      blocked.push(route.request().url());
      await route.abort();
    });

    await page.reload();

    await expect(page).toHaveTitle(/Playwright/);
    await expect(page.getByRole('link', { name: 'Get started' })).toBeVisible();
    expect(blocked.length).toBeGreaterThan(0);
  });
});
