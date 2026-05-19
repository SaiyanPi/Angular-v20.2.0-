import { expect, test } from '@playwright/test';

test.describe('Races page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display a race list', async ({ page }) => {
    await expect(page.getByRole('heading', { level: 2 })).toHaveCount(2);
    await expect(page.locator('.container ul li')).toHaveCount(10);
  });
});
