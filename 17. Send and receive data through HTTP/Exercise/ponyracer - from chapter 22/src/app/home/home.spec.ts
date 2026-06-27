import { signal, WritableSignal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { page } from 'vitest/browser';
import { UserModel } from '../models/user-model';
import { UserService } from '../services/user-service';
import { Home } from './home';

class HomeTester {
  readonly fixture = TestBed.createComponent(Home);
  readonly title = page.getByRole('heading', { level: 1 });
  readonly subtitle = this.title.getByCss('small');
  readonly racesLink = page.getByRole('link', { name: 'Races' });
  readonly loginLink = page.getByRole('link', { name: 'Login' });
  readonly registerLink = page.getByRole('link', { name: 'Register' });
}

describe('Home', () => {
  let currentUser: WritableSignal<UserModel | undefined>;

  function prepare() {
    currentUser = signal(undefined);
    const userService: Pick<UserService, 'currentUser'> = { currentUser };
    TestBed.configureTestingModule({
      providers: [provideRouter([]), { provide: UserService, useValue: userService }]
    });
  }

  beforeEach(() => prepare());

  it('should display the title and quote', async () => {
    const tester = new HomeTester();

    await expect.element(tester.title).toHaveTextContent('Ponyracer');
    await expect.element(tester.subtitle).toHaveTextContent('Always a pleasure to bet on ponies');
  });

  it('should display a link to go to the login page and another to the register page', async () => {
    const tester = new HomeTester();

    await expect.element(tester.loginLink).toHaveAttribute('href', '/login');

    await expect.element(tester.registerLink).toHaveAttribute('href', '/register');

    await expect.element(tester.racesLink).not.toBeInTheDocument();
  });

  it('should display only a link to go the races page if logged in', async () => {
    const tester = new HomeTester();
    currentUser.set({ login: 'cedric' } as UserModel);

    await expect.element(tester.racesLink).toHaveAttribute('href', '/races');
    await expect.element(tester.loginLink).not.toBeInTheDocument();
    await expect.element(tester.registerLink).not.toBeInTheDocument();
  });
});
