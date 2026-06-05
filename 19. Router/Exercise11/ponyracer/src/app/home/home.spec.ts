import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { page } from 'vitest/browser';
import { Home } from './home';

class HomeTester {
  readonly fixture = TestBed.createComponent(Home);
  readonly title = page.getByRole('heading', { level: 1 });
  readonly subtitle = this.title.getByCss('small');
  readonly racesLink = page.getByRole('link', { name: 'Races' });
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

  it('should display only a link to go the races page', async () => {
    const tester = new HomeTester();

    await expect.element(tester.racesLink).toHaveAttribute('href', '/races');
  });
});
