import { signal, WritableSignal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter, Router, RouterLink } from '@angular/router';
import { Mocked } from 'vitest';
import { page } from 'vitest/browser';
import { UserModel } from '../models/user-model';
import { UserService } from '../services//user-service';
import { Menu } from './menu';

class MenuTester {
  readonly fixture = TestBed.createComponent(Menu);
  readonly navbar = page.getByCss('#navbar');
  readonly toggleButton = page.getByRole('button');
  readonly currentUser = page.getByCss('#current-user');
  readonly logoutButton = page.getByCss('button:has(.fa-power-off)');
}

describe('Menu', () => {
  let currentUser: WritableSignal<UserModel | undefined>;
  let userService: Pick<Mocked<UserService>, 'logout'> & Pick<UserService, 'currentUser'>;

  beforeEach(() => {
    currentUser = signal(undefined);
    userService = {
      logout: vi.fn().mockName('UserService.logout'),
      currentUser
    };
    TestBed.configureTestingModule({
      providers: [provideRouter([]), { provide: UserService, useValue: userService }]
    });
  });

  it('should toggle the class on click', async () => {
    const tester = new MenuTester();

    await expect.element(tester.navbar).toBeInTheDocument();
    await expect.element(tester.navbar).toHaveClass('collapse');
    await expect.element(tester.toggleButton).toBeInTheDocument();

    await tester.toggleButton.click();

    await expect.element(tester.navbar).not.toHaveClass('collapse');

    await tester.toggleButton.click();

    await expect.element(tester.navbar).toHaveClass('collapse');
  });

  it('should use routerLink to navigate', async () => {
    const tester = new MenuTester();

    await expect.element(tester.navbar).toBeInTheDocument();

    const routerLinks = tester.fixture.debugElement.queryAll(By.directive(RouterLink));

    expect(routerLinks, 'You should have only 1 routerLink to the home page when the user is not logged in').toHaveLength(1);

    currentUser.set({ login: 'cedric', money: 2000 } as UserModel);

    await expect.element(tester.currentUser).toHaveTextContent('cedric');

    const linksAfterLogin = tester.fixture.debugElement.queryAll(By.directive(RouterLink));

    expect(
      linksAfterLogin,
      'You should have 2 routerLink: one to the races and one to the home page when the user is logged in'
    ).toHaveLength(2);
  });

  it('should display the user if logged in', async () => {
    const tester = new MenuTester();

    await expect.element(tester.navbar).toBeInTheDocument();

    currentUser.set({ login: 'cedric', money: 2000 } as UserModel);

    await expect.element(tester.currentUser).toHaveTextContent('cedric');
    await expect.element(tester.currentUser).toHaveTextContent('2,000');
  });

  it('should display a logout button', async () => {
    const tester = new MenuTester();
    await tester.toggleButton.click();

    const router = TestBed.inject(Router);
    vi.spyOn(router, 'navigateByUrl');

    currentUser.set({ login: 'cedric', money: 2000 } as UserModel);

    await expect.element(tester.logoutButton).toBeVisible();
    await expect.element(tester.logoutButton.getByCss('span.fa-power-off')).toBeVisible();

    await tester.logoutButton.click();

    expect(userService.logout).toHaveBeenCalledWith();
    expect(router.navigateByUrl).toHaveBeenCalledWith('/');
  });
});
