import { signal, WritableSignal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { page } from 'vitest/browser';
import { provideI18nTesting } from '../../i18n-test-utils';
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

class HomeNepaliTester {
  readonly fixture = TestBed.createComponent(Home);
  readonly title = page.getByRole('heading', { level: 1 });
  readonly subtitle = this.title.getByCss('small');
  readonly loginLink = page.getByRole('link', { name: 'लगइन' });
  readonly registerLink = page.getByRole('link', { name: 'दर्ता गर्नुहोस्' });
  readonly racesLink = page.getByRole('link', { name: 'दौडहरू' });
}

describe('Home', () => {
  let currentUser: WritableSignal<UserModel | undefined>;

  function prepare(lang: 'en' | 'ne') {
    currentUser = signal(undefined);
    const userService: Pick<UserService, 'currentUser'> = { currentUser };
    TestBed.configureTestingModule({
      providers: [provideI18nTesting(lang), provideRouter([]), { provide: UserService, useValue: userService }]
    });
  }

  describe('in English', () => {
    beforeEach(() => prepare('en'));

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

  describe('in Nepali', () => {
    beforeEach(() => prepare('ne'));

    it('should translate the texts', async () => {
      const tester = new HomeNepaliTester();

      await expect.element(tester.title).toHaveTextContent('Ponyracer');
      await expect.element(tester.subtitle).toHaveTextContent('घोडा दौडमा बाजी लगाउन सधैं रमाइलो लाग्छ।');

      await expect.element(tester.loginLink).toHaveAttribute('href', '/login');

      await expect.element(tester.registerLink).toHaveAttribute('href', '/register');

      currentUser.set({ login: 'cedric' } as UserModel);

      await expect.element(tester.racesLink).toHaveAttribute('href', '/races');
    });
  });
});
