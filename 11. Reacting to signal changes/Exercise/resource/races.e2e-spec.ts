import { expect, test } from '@playwright/test';

test.describe('Races page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display a race list', async ({ page }) => {
    await expect(page.getByRole('heading', { level: 2 })).toHaveCount(2);
  });

  test('should display ponies', async ({ page }) => {
    await expect(page.locator('figure')).toHaveCount(10);
    await expect(page.getByRole('img')).toHaveCount(10);
    await expect(page.locator('figcaption')).toHaveCount(10);
  });
});
