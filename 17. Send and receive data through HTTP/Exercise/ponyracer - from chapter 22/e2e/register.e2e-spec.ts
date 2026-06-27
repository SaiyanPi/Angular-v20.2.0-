import { expect, test } from '@playwright/test';

test.describe('Register page', () => {
  const user = {
    id: 1,
    login: 'cedric',
    money: 1000,
    registrationInstant: '2015-12-01T11:00:00Z',
    token: 'eyJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQiOjF9.5cAW816GUAg3OWKWlsYyXI4w3fDrS5BpnmbyBjVM7lo'
  };

  test('should display a register page', async ({ page }) => {
    await page.route('**/api/users', async route => {
      await route.fulfill({
        status: 200,
        json: user
      });
    });

    await page.goto('/register');

    const loginInput = page.locator('input').first();
    const passwordInput = page.locator('input[type=password]').first();
    const confirmInput = page.locator('input[type=password]').nth(1);
    const birthYearInput = page.locator('input[type=number]');
    const submitButton = page.locator('form > button');

    await expect(submitButton).toBeVisible();

    await loginInput.fill('c');
    await loginInput.blur();
    await loginInput.clear();
    await loginInput.blur();
    await expect(page.locator('form')).toContainText('Login is required');

    await loginInput.fill('ced');
    await loginInput.blur();
    await expect(page.locator('form')).not.toContainText('Login is required');

    await passwordInput.fill('p');
    await passwordInput.blur();
    await passwordInput.clear();
    await passwordInput.blur();
    await expect(page.locator('form')).toContainText('Password is required');

    await passwordInput.fill('pa');
    await passwordInput.blur();
    await expect(page.locator('form')).not.toContainText('Password is required');

    await confirmInput.fill('p');
    await confirmInput.blur();
    await confirmInput.clear();
    await confirmInput.blur();
    await expect(page.locator('form')).toContainText('Password confirmation is required');

    await confirmInput.fill('p');
    await confirmInput.blur();
    await expect(page.locator('form')).toContainText('Your password does not match');

    await confirmInput.fill('pa');
    await confirmInput.blur();
    await expect(page.locator('form')).not.toContainText('Your password does not match');

    await birthYearInput.fill('1');
    await birthYearInput.blur();
    await birthYearInput.clear();
    await birthYearInput.blur();
    await expect(page.locator('form')).toContainText('Birth year is required');

    await birthYearInput.fill(`${new Date().getFullYear() + 1}`);
    await birthYearInput.blur();
    await expect(page.locator('form')).toContainText('This is not a valid year');

    await birthYearInput.clear();
    await birthYearInput.blur();
    await birthYearInput.fill('86');
    await birthYearInput.blur();
    await expect(page.locator('form')).not.toContainText('This is not a valid year');
    await expect(page.locator('.formatted-year')).toContainText('1986');

    const response = page.waitForResponse('**/api/users');
    await submitButton.click();
    await response;

    await expect(page).toHaveURL('/');
  });
});
