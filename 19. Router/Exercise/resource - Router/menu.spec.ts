import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter, RouterLink } from '@angular/router';
import { page } from 'vitest/browser';
import { Menu } from './menu';

class MenuTester {
  readonly fixture = TestBed.createComponent(Menu);
  readonly root = page.elementLocator(this.fixture.nativeElement);
  readonly navbar = page.getByCss('#navbar');
  readonly toggleButton = page.getByRole('button');
}

describe('Menu', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideRouter([])]
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

    await expect.element(tester.root).toBeVisible();

    const routerLinks = tester.fixture.debugElement.queryAll(By.directive(RouterLink));

    expect(routerLinks, 'You should have 2 routerLinks: one to the home and one to the races page').toHaveLength(2);
  });
});
