import { expect, test } from '@playwright/test';

test.describe('Home page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display a title', async ({ page }) => {
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Ponyracer');
  });

  test('should display a navbar', async ({ page }) => {
    const navbar = page.getByRole('navigation');
    await expect(navbar.getByText('PonyRacer')).toBeVisible();
    await expect(navbar.getByText('Races')).toBeVisible();
  });

  test('should display a navbar collapsed on small screen', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    const navbar = page.getByRole('navigation');
    const navbarBrand = navbar.getByText('PonyRacer');
    await expect(navbarBrand).toBeVisible();
    const navbarLink = navbar.getByText('Races');
    await expect(navbarLink).not.toBeVisible();

    // toggle the navbar
    const navbarToggler = page.locator('.navbar-toggler');
    await navbarToggler.click();
    await expect(navbarLink).toBeVisible();

    // toggle the navbar again
    await navbarToggler.click();
    await expect(navbarLink).not.toBeVisible();
  });
});
