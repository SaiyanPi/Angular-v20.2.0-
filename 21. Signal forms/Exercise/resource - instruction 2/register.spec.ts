import { TestBed } from '@angular/core/testing';
import { provideSignalFormsConfig } from '@angular/forms/signals';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { of, throwError } from 'rxjs';
import { Mocked } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import { UserModel } from '../models/user-model';
import { UserService } from '../services/user-service';
import { Register } from './register';

class RegisterTester {
  constructor(readonly harness: RouterTestingHarness) {}

  readonly title = page.getByRole('heading', { level: 1 });
  readonly loginInput = page.getByLabelText('Login');
  readonly passwordInput = page.getByLabelText('Password', { exact: true });
  readonly passwordConfirmationInput = page.getByLabelText('Confirm password');
  readonly birthYearInput = page.getByLabelText('Birth year');
  readonly errorMessages = page.getByCss('.invalid-feedback');
  readonly submitButton = page.getByRole('button', { name: "Let's go!" });
  readonly alert = page.getByRole('alert');
}

describe('Register', () => {
  let userService: Pick<Mocked<UserService>, 'register'>;

  beforeEach(() => {
    userService = { register: vi.fn().mockName('UserService.register') };
    TestBed.configureTestingModule({
      providers: [
        provideRouter([{ path: 'register', component: Register }]),
        provideSignalFormsConfig({
          classes: {
            'is-invalid': field => field.state().invalid() && field.state().touched()
          }
        }),
        { provide: UserService, useValue: userService }
      ]
    });
  });

  it('should validate the login input', async () => {
    const tester = new RegisterTester(await RouterTestingHarness.create('/register'));

    await expect.element(tester.loginInput).toBeVisible();

    await tester.loginInput.fill('');
    await userEvent.tab();

    await expect.element(tester.errorMessages.nth(0)).toHaveTextContent('Login is required');
    await expect.element(tester.loginInput).toHaveClass('is-invalid');

    await tester.loginInput.fill('Cé');
    await userEvent.tab();

    await expect.element(tester.errorMessages.nth(0)).toHaveTextContent('Your login should be at least 3 characters');

    await tester.loginInput.fill('Cédric');
    await userEvent.tab();

    await expect.element(tester.loginInput).not.toHaveClass('is-invalid');
  });

  it('should validate the password input', async () => {
    const tester = new RegisterTester(await RouterTestingHarness.create('/register'));

    await expect.element(tester.passwordInput).toBeVisible();
    await expect.element(tester.passwordInput).toHaveAttribute('type', 'password');

    await tester.passwordInput.fill('');
    await userEvent.tab();

    await expect.element(tester.errorMessages.nth(0)).toHaveTextContent('Password is required');
    await expect.element(tester.passwordInput).toHaveClass('is-invalid');
  });

  it('should validate the password confirmation input', async () => {
    const tester = new RegisterTester(await RouterTestingHarness.create('/register'));

    await expect.element(tester.passwordConfirmationInput).toBeVisible();
    await expect.element(tester.passwordInput).toHaveAttribute('type', 'password');

    await tester.passwordConfirmationInput.fill('');
    await userEvent.tab();

    await expect.element(tester.errorMessages.nth(0)).toHaveTextContent('Password confirmation is required');
    await expect.element(tester.passwordConfirmationInput).toHaveClass('is-invalid');
  });

  it('should validate that passwords match', async () => {
    const tester = new RegisterTester(await RouterTestingHarness.create('/register'));

    await tester.passwordInput.fill('password');
    await tester.passwordConfirmationInput.fill('passwor');
    await userEvent.tab();

    await expect.element(tester.errorMessages.nth(0)).toHaveTextContent('Your password does not match');
    await expect.element(tester.passwordConfirmationInput).toHaveClass('is-invalid');

    await tester.passwordConfirmationInput.fill('password');

    await expect.element(tester.errorMessages).not.toHaveTextContent('Your password does not match');
    await expect.element(tester.passwordConfirmationInput).not.toHaveClass('is-invalid');
  });

  it('should validate the birth year', async () => {
    const tester = new RegisterTester(await RouterTestingHarness.create('/register'));

    await expect.element(tester.birthYearInput).toBeVisible();
    await expect.element(tester.birthYearInput).toHaveAttribute('type', 'number');

    await tester.birthYearInput.fill('');
    await userEvent.tab();

    await expect.element(tester.errorMessages.nth(0)).toHaveTextContent('Birth year is required');
    await expect.element(tester.birthYearInput).toHaveClass('is-invalid');

    // given an invalid value before 1900
    await tester.birthYearInput.fill('1899');
    await userEvent.tab();

    await expect.element(tester.errorMessages.nth(0)).toHaveTextContent('This is not a valid year');

    // given an invalid value in the future
    await tester.birthYearInput.fill(`${new Date().getFullYear() + 1}`);
    await userEvent.tab();

    await expect.element(tester.errorMessages.nth(0)).toHaveTextContent('This is not a valid year');

    // given a valid value
    await tester.birthYearInput.fill('1982');
    await userEvent.tab();

    await expect.element(tester.errorMessages).toHaveLength(0);
  });

  it('should displays errors on submit if the form is invalid', async () => {
    const tester = new RegisterTester(await RouterTestingHarness.create('/register'));

    await tester.submitButton.click();

    await expect.element(tester.errorMessages.nth(0)).toHaveTextContent('Login is required');
    await expect.element(tester.errorMessages.nth(1)).toHaveTextContent('Password is required');
    await expect.element(tester.errorMessages.nth(2)).toHaveTextContent('Password confirmation is required');
    await expect.element(tester.errorMessages.nth(3)).toHaveTextContent('Birth year is required');

    expect(userService.register, 'The user service should not be called if the form is invalid').not.toHaveBeenCalled();
  });

  it('should call the user service to register', async () => {
    const tester = new RegisterTester(await RouterTestingHarness.create('/register'));

    userService.register.mockReturnValue(of({ id: 1 } as UserModel));

    // fill the form
    await tester.loginInput.fill('Cédric');
    await tester.passwordInput.fill('password');
    await tester.passwordConfirmationInput.fill('password');
    await tester.birthYearInput.fill('1986');
    await tester.submitButton.click();

    // then we should have called the user service
    expect(userService.register).toHaveBeenCalledWith('Cédric', 'password', 1986);

    // and navigated to the home
    const router = TestBed.inject(Router);

    expect(router.url).toBe('/');
  });

  it('should display an error message if registration fails', async () => {
    const tester = new RegisterTester(await RouterTestingHarness.create('/register'));

    userService.register.mockImplementation(() => throwError(() => new Error('Oops')));

    // fill the form
    await tester.loginInput.fill('Cédric');
    await tester.passwordInput.fill('password');
    await tester.passwordConfirmationInput.fill('password');
    await tester.birthYearInput.fill('1986');
    await tester.submitButton.click();

    // then we should have called the user service
    expect(userService.register).toHaveBeenCalledWith('Cédric', 'password', 1986);

    // and not navigate
    const router = TestBed.inject(Router);

    expect(router.url).not.toBe('/');
    // and display the error message
    await expect.element(tester.alert).toHaveTextContent('Try again with another login.');
    await expect.element(tester.alert).toHaveClass('alert-danger');
  });
});
