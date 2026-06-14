import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { page } from 'vitest/browser';
import { Home } from './home';

class HomeTester {
  readonly fixture = TestBed.createComponent(Home);
  readonly title = page.getByRole('heading', { level: 1 });
  readonly subtitle = this.title.getByCss('small');
  readonly racesLink = page.getByRole('link', { name: 'Races' });
  readonly loginLink = page.getByRole('link', { name: 'Login' });
}

describe('Home', () => {
  function prepare() {
    TestBed.configureTestingModule({
      providers: [provideRouter([])]
    });
  }

  beforeEach(() => prepare());

  it('should display the title and quote', async () => {
    const tester = new HomeTester();

    await expect.element(tester.title).toHaveTextContent('Ponyracer');
    await expect.element(tester.subtitle).toHaveTextContent('Always a pleasure to bet on ponies');
  });

  it('should display a link to go to the login page', async () => {
    const tester = new HomeTester();

    await expect.element(tester.loginLink).toHaveAttribute('href', '/login');

    await expect.element(tester.racesLink).not.toBeInTheDocument();
  });
});
