import { signal, WritableSignal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter, Router, RouterLink } from '@angular/router';
import { of, Subject } from 'rxjs';
import { Mocked } from 'vitest';
import { page } from 'vitest/browser';
import { UserModel } from '../models/user-model';
import { UserService } from '../services/user-service';
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
  let userService: Pick<Mocked<UserService>, 'logout' | 'scoreUpdates'> & Pick<UserService, 'currentUser'>;

  beforeEach(() => {
    currentUser = signal(undefined);
    userService = {
      logout: vi.fn().mockName('UserService.logout'),
      scoreUpdates: vi.fn().mockName('UserService.scoreUpdates'),
      currentUser
    };
    TestBed.configureTestingModule({
      providers: [provideRouter([]), { provide: UserService, useValue: userService }]
    });
    userService.scoreUpdates.mockReturnValue(of());
  });

  it('should toggle the class on click', async () => {
    const tester = new MenuTester();

    await expect.element(tester.navbar).toBeInTheDocument();
    await expect.element(tester.navbar).not.toHaveClass('show');
    await expect.element(tester.toggleButton).toBeInTheDocument();

    await tester.toggleButton.click();

    await expect.element(tester.navbar).toHaveClass('show');

    await tester.toggleButton.click();

    await expect.element(tester.navbar).not.toHaveClass('show');
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
      'You should have 3 routerLink: one to the races, one to the home, and one to the score history when the user is logged in'
    ).toHaveLength(3);
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

  it('should listen to score updates', async () => {
    // emulate a login
    const scoreUpdates = new Subject<UserModel>();
    userService.scoreUpdates.mockReturnValue(scoreUpdates);

    const tester = new MenuTester();
    await tester.toggleButton.click();

    const user = { id: 1, login: 'cedric', money: 200 } as UserModel;
    currentUser.set(user);

    await expect.element(tester.currentUser).toHaveTextContent('cedric');
    await expect.element(tester.currentUser).toHaveTextContent('200');
    expect(userService.scoreUpdates).toHaveBeenCalledWith(user.id);

    // emulate a score update
    scoreUpdates.next({ ...user, money: 300 });

    await expect.element(tester.currentUser).toHaveTextContent('300');

    // emulate an error
    scoreUpdates.error('You should catch potential errors on score updates with a `.catchError()`');

    await expect.element(tester.currentUser).toHaveTextContent('300');

    // emulate a logout
    currentUser.set(undefined);

    await expect.element(tester.currentUser).not.toBeInTheDocument();
  });
});
