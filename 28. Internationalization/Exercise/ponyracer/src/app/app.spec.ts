import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { page } from 'vitest/browser';
import { provideI18nTesting } from '../i18n-test-utils';
import { App } from './app';
import { WsService } from './services/ws-service';

class AppTester {
  readonly fixture = TestBed.createComponent(App);
  readonly menu = page.getByCss('pr-menu');
  readonly routerOutlet = page.getByCss('router-outlet');
}

describe('App', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      providers: [
        provideI18nTesting('ne'),
        provideHttpClientTesting(),
        provideRouter([]),
        {
          provide: WsService,
          useValue: { connect: vi.fn().mockName('WsService.connect') }
        }
      ]
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
