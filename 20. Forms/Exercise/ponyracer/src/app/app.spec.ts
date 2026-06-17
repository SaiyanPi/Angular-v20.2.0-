import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter, withComponentInputBinding } from '@angular/router';
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
      providers: [provideHttpClientTesting(), provideRouter([], withComponentInputBinding())]
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
