import { TestBed } from '@angular/core/testing';
import { page } from 'vitest/browser';
import { App } from './app';

class AppTester {
  readonly fixture = TestBed.createComponent(App);
  readonly title = page.getByRole('heading', { level: 1 });
  readonly menu = page.getByCss('pr-menu');
}

describe('App', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should have a title', async () => {
    const tester = new AppTester();

    await expect.element(tester.title).toHaveTextContent('Ponyracer');
  });

  it('should display the menu component', async () => {
    const tester = new AppTester();

    await expect.element(tester.menu).toBeVisible();
  });
});
