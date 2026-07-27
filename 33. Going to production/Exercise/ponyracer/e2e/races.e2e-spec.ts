import { expect, test } from '@playwright/test';

test.describe('Races page', () => {
  const race = {
    id: 12,
    name: 'Paris',
    ponies: [
      { id: 1, name: 'Gentle Pie', color: 'YELLOW' },
      { id: 2, name: 'Big Soda', color: 'ORANGE' },
      { id: 3, name: 'Gentle Bottle', color: 'PURPLE' },
      { id: 4, name: 'Superb Whiskey', color: 'GREEN' },
      { id: 5, name: 'Fast Rainbow', color: 'BLUE' }
    ],
    startInstant: '2020-02-18T08:02:00Z'
  };

  const user = {
    id: 1,
    login: 'cedric',
    money: 1000,
    registrationInstant: '2015-12-01T11:00:00Z',
    token: 'eyJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQiOjF9.5cAW816GUAg3OWKWlsYyXI4w3fDrS5BpnmbyBjVM7lo'
  };

  test.beforeEach(async ({ page }) => {
    await page.route('**/api/races?status=PENDING', async route => {
      await route.fulfill({
        status: 200,
        json: [
          race,
          {
            id: 13,
            name: 'Tokyo',
            ponies: [
              { id: 6, name: 'Fast Rainbow', color: 'BLUE' },
              { id: 7, name: 'Gentle Castle', color: 'GREEN' },
              { id: 8, name: 'Awesome Rock', color: 'PURPLE' },
              { id: 9, name: 'Little Rainbow', color: 'YELLOW' },
              { id: 10, name: 'Great Soda', color: 'ORANGE' }
            ],
            startInstant: '2020-02-18T08:03:00Z'
          }
        ]
      });
    });
    await page.route('**/api/races?status=FINISHED', async route => {
      await route.fulfill({
        status: 200,
        json:
          // array filled with the same race object 60 times
          Array.from({ length: 60 }, (_, i) => ({
            id: i,
            name: 'Tokyo ' + i,
            ponies: [
              { id: 11, name: 'Fast Rainbow', color: 'YELLOW' },
              { id: 12, name: 'Gentle Castle', color: 'ORANGE' },
              { id: 13, name: 'Awesome Rock', color: 'PURPLE' },
              { id: 14, name: 'Little Rainbow', color: 'BLUE' },
              { id: 15, name: 'Great Soda', color: 'GREEN' }
            ],
            startInstant: '2020-02-18T08:01:00Z'
          }))
      });
    });
    await page.goto('/races');
  });

  test('should display a race list', async ({ page }) => {
    // not logged, so redirected
    await expect(page).toHaveURL('/');

    // store the user in localStorage
    await page.evaluate(user => localStorage.setItem('rememberMe', JSON.stringify(user)), user);
    const racePromise = page.waitForResponse('**/api/races?status=PENDING');
    await page.goto('/races');
    await racePromise;

    // redirected to pending races
    await expect(page).toHaveURL('/races/pending');

    // now we can see the list
    const pendingRacesTab = () => page.locator('.nav-tabs .nav-link').first();
    const finishedRacesTab = () => page.locator('.nav-tabs .nav-link').nth(1);
    await expect(pendingRacesTab()).toHaveClass(/active/);
    await expect(finishedRacesTab()).not.toHaveClass(/active/);
    await expect(page.getByRole('heading', { level: 2 })).toHaveCount(2);
    const paragraphs = page.getByRole('paragraph');
    await expect(paragraphs).toHaveCount(2);
    await expect(paragraphs.first()).toContainText('ago');
    await expect(page.locator('figure')).toHaveCount(10);
    await expect(page.getByRole('img')).toHaveCount(10);
    await expect(page.locator('figcaption')).toHaveCount(10);

    // click on the finished races tab
    const finishedRacesPromise = page.waitForResponse('**/api/races?status=FINISHED');
    await finishedRacesTab().click();
    await finishedRacesPromise;
    await expect(page).toHaveURL('/races/finished');
    await expect(pendingRacesTab()).not.toHaveClass(/active/);
    await expect(finishedRacesTab()).toHaveClass(/active/);

    // results are paginated
    const pagination = page.locator('.pagination');
    await expect(pagination).toHaveCount(1);

    // when we click on the third page
    await page.locator('.pagination .page-item').nth(3).click();
    // then the URL contains the page number
    await expect(page).toHaveURL(/.*\?page=3/);

    // and the page should display the correct races
    await expect(page.getByRole('heading', { level: 2 })).toHaveCount(10);
    await expect(page.getByRole('heading', { level: 2 }).first()).toContainText('Tokyo 20');

    // when we click on next
    await page.locator('.pagination .page-item').nth(7).click();
    // then the URL contains the next page number
    await expect(page).toHaveURL(/.*\?page=4/);

    // and the page should display the correct races
    await expect(page.getByRole('heading', { level: 2 })).toHaveCount(10);
    await expect(page.getByRole('heading', { level: 2 }).first()).toContainText('Tokyo 30');

    // when we click on previous
    await page.locator('.pagination .page-item').first().click();
    // then the URL contains the previous page number
    await expect(page).toHaveURL(/.*\?page=3/);
  });
});
