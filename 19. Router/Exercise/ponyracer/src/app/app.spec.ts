import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { page } from 'vitest/browser';
import { App } from './app';

class AppTester {
  readonly fixture = TestBed.createComponent(App);
  readonly menu = page.getByCss('pr-menu');
  readonly routerOutlet = page.getByCss('router-outlet');
}

describe('App', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      providers: [provideRouter([])]
    })
  );

  it('should have a router outlet', async () => {
    const tester = new AppTester();

    await expect.element(tester.routerOutlet).toBeInTheDocument();
  });

  it('should display the menu component', async () => {
    const tester = new AppTester();

    await expect.element(tester.menu).toBeVisible();
  });
});
