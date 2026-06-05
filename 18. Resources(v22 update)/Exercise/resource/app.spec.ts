import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { page } from 'vitest/browser';
import { App } from './app';

class AppTester {
  readonly fixture = TestBed.createComponent(App);
  readonly title = page.getByRole('heading', { level: 1 });
  readonly menu = page.getByCss('pr-menu');
  readonly races = page.getByCss('pr-races');
}

describe('App', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClientTesting()]
    });
  });

  it('should have a title', async () => {
    const tester = new AppTester();

    await expect.element(tester.title).toHaveTextContent('Ponyracer');
  });

  it('should display the menu component', async () => {
    const tester = new AppTester();

    await expect.element(tester.menu).toBeVisible();
  });

  it('should display the races component', async () => {
    const tester = new AppTester();
    TestBed.tick();
    const http = TestBed.inject(HttpTestingController);
    http
      .expectOne('https://ponyracer.ninja-squad.com/api/races?status=PENDING')
      .flush([{ id: 1, name: 'Tokyo', startInstant: '2024-02-18T08:03:00' }]);

    await expect.element(tester.races).toBeVisible();
  });
});
