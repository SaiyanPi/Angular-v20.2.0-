import { TestBed } from '@angular/core/testing';
import { provideSignalFormsConfig } from '@angular/forms/signals';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { Subject } from 'rxjs';
import { Mocked } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import { UserModel } from '../models/user-model';
import { UserService } from '../services/user-service';
import { Login } from './login';

class LoginTester {
  constructor(readonly harness: RouterTestingHarness) {}

  readonly title = page.getByRole('heading', { level: 1 });
  readonly loginInput = page.getByLabelText('Login');
  readonly passwordInput = page.getByLabelText('Password');
  readonly errorMessages = page.getByCss('.invalid-feedback');
  readonly submitButton = page.getByRole('button', { name: 'Log me in!' });
  readonly alert = page.getByRole('alert');
}

describe('Login', () => {
  let userService: Pick<Mocked<UserService>, 'authenticate'>;

  beforeEach(() => {
    userService = { authenticate: vi.fn().mockName('UserService.authenticate') };
    TestBed.configureTestingModule({
      providers: [
        provideRouter([{ path: 'login', component: Login }]),
        provideSignalFormsConfig({
          classes: {
            'is-invalid': field => field.state().invalid() && field.state().touched()
          }
        }),
        { provide: UserService, useValue: userService }
      ]
    });
  });

  it('should have a title', async () => {
    const tester = new LoginTester(await RouterTestingHarness.create('/login'));

    // then we should have a title
    await expect.element(tester.title).toHaveTextContent('Log in');
  });

  it('should display error messages if fields are touched and invalid', async () => {
    const tester = new LoginTester(await RouterTestingHarness.create('/login'));

    await expect.element(tester.loginInput).toBeVisible();

    await tester.loginInput.fill('');
    await userEvent.tab();

    await expect.element(tester.errorMessages.nth(0)).toHaveTextContent('Login is required');
    await expect.element(tester.loginInput).toHaveClass('is-invalid');

    await tester.loginInput.fill('login');

    await expect.element(tester.loginInput).not.toHaveClass('is-invalid');

    await expect.element(tester.passwordInput).toHaveAttribute('type', 'password');

    await tester.passwordInput.fill('');

    await expect.element(tester.errorMessages.nth(0)).toHaveTextContent('Password is required');
    await expect.element(tester.passwordInput).toHaveClass('is-invalid');
  });

  it('should displays errors on submit if the form is invalid', async () => {
    const tester = new LoginTester(await RouterTestingHarness.create('/login'));
    await tester.submitButton.click();

    await expect.element(tester.errorMessages.nth(0)).toHaveTextContent('Login is required');
    await expect.element(tester.errorMessages.nth(1)).toHaveTextContent('Password is required');

    expect(userService.authenticate, 'The user service should not be called if the form is invalid').not.toHaveBeenCalled();
  });

  it('should call the user service and redirect if success', async () => {
    const tester = new LoginTester(await RouterTestingHarness.create('/login'));

    const subject = new Subject<UserModel>();
    userService.authenticate.mockReturnValue(subject);

    await tester.loginInput.fill('login');
    await tester.passwordInput.fill('password');
    await tester.submitButton.click();

    // then we should have called the user service method
    expect(userService.authenticate).toHaveBeenCalledWith('login', 'password');

    subject.next({} as UserModel);

    // and redirect to the home
    await expect.element(tester.loginInput).not.toBeInTheDocument();

    const router = TestBed.inject(Router);

    expect(router.url).toBe('/');
  });

  it('should call the user service and display a message if failed', async () => {
    const tester = new LoginTester(await RouterTestingHarness.create('/login'));

    await expect.element(tester.submitButton).toBeVisible();

    const subject = new Subject<UserModel>();
    userService.authenticate.mockReturnValue(subject);

    await expect.element(tester.alert).not.toBeInTheDocument();

    await tester.loginInput.fill('login');
    await tester.passwordInput.fill('password');
    await tester.submitButton.click();

    // then we should have called the user service method
    expect(userService.authenticate).toHaveBeenCalledWith('login', 'password');

    subject.error(new Error());

    await expect.element(tester.alert).toHaveTextContent('Nope, Try again');
    await expect.element(tester.alert).toHaveClass('alert-danger');
  });
});
