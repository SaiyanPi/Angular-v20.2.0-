import { expect, test } from '@playwright/test';

test.describe('Score history page', () => {
  const user = {
    id: 1,
    login: 'cedric',
    money: 1000,
    registrationInstant: '2015-12-01T11:00:00Z',
    token: 'eyJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQiOjF9.5cAW816GUAg3OWKWlsYyXI4w3fDrS5BpnmbyBjVM7lo'
  };

  test.beforeEach(async ({ page }) => {
    await page.route('**/api/money/history', async route => {
      await route.fulfill({
        status: 200,
        json: [
          { instant: '2021-01-08T15:20:29.034219Z', money: 9800 },
          { instant: '2021-02-04T17:38:30.012766Z', money: 9600 },
          { instant: '2021-04-03T07:59:31.024788Z', money: 10400 },
          { instant: '2021-04-12T07:34:29.017760Z', money: 11200 },
          { instant: '2021-04-22T15:53:30.012061Z', money: 11000 }
        ]
      });
    });

    await page.goto('/');
    await page.evaluate(user => localStorage.setItem('rememberMe', JSON.stringify(user)), user);
  });

  test('should display the score history of the user', async ({ page }) => {
    await page.goto('/score-history');
    await page.waitForResponse('**/api/money/history');

    await expect(page.getByRole('heading', { level: 1 })).toContainText('Score history');
    await expect(page.locator('canvas')).toBeVisible();
  });
});
