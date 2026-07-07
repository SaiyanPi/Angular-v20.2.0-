import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { disabled, form, FormField, required } from '@angular/forms/signals';
import { page, userEvent } from 'vitest/browser';
import { BirthYearInput } from './birth-year-input';

class BirthYearInputTester {
  readonly fixture = TestBed.createComponent(BirthYearInputTest);
  readonly input = page.getByLabelText('Birth year');
  readonly formattedYear = page.getByCss('.formatted-year');
  readonly parentFormValue = page.getByCss('span');
  readonly errors = page.getByCss('.error');
}

@Component({
  template: `<form>
    <label for="birth-year">Birth year</label>
    <pr-birth-year-input inputId="birth-year" [formField]="form.birthYear" />
    <span>{{ user().birthYear }}</span>
  </form>`,
  imports: [FormField, BirthYearInput]
})
class BirthYearInputTest {
  readonly isDisabled = signal(false);
  readonly user = signal({ birthYear: 1982 as number | null });
  readonly form = form(this.user, f => {
    disabled(f.birthYear, { when: this.isDisabled });
    required(f.birthYear);
  });
}

describe('BirthYearInput', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should display the initial value and update it', async () => {
    const tester = new BirthYearInputTester();

    await expect.element(tester.input).toHaveDisplayValue('1982');
    await expect.element(tester.formattedYear).toHaveTextContent('1982');
    await expect.element(tester.parentFormValue).toHaveTextContent('1982');

    await tester.input.fill('1983');
    await userEvent.tab();

    await expect.element(tester.formattedYear).toHaveTextContent('1983');
    await expect.element(tester.parentFormValue).toHaveTextContent('1983');
  });

  it('should transform negative value', async () => {
    const tester = new BirthYearInputTester();

    // negative value
    await tester.input.fill('-1982');
    await userEvent.tab();

    await expect.element(tester.formattedYear).toHaveTextContent('-1982');
    await expect.element(tester.parentFormValue).toHaveTextContent('-1982');
  });

  it('should transform value less than 1900', async () => {
    const tester = new BirthYearInputTester();

    // value less than 1900
    await tester.input.fill('1882');
    await userEvent.tab();

    await expect.element(tester.formattedYear).toHaveTextContent('1882');
    await expect.element(tester.parentFormValue).toHaveTextContent('1882');
  });

  it('should transform value greater than current year', async () => {
    const tester = new BirthYearInputTester();

    const currentYear = new Date().getFullYear();
    await tester.input.fill(`${currentYear + 1}`);
    await userEvent.tab();

    await expect.element(tester.formattedYear).toHaveTextContent(`${currentYear + 1}`);
    await expect.element(tester.parentFormValue).toHaveTextContent(`${currentYear + 1}`);
  });

  it('should transform value after 1900 and before current year', async () => {
    const tester = new BirthYearInputTester();

    await tester.input.fill('1982');
    await userEvent.tab();

    await expect.element(tester.formattedYear).toHaveTextContent('1982');
    await expect.element(tester.parentFormValue).toHaveTextContent('1982');
  });

  it('should transform value greater than 100 and lower than 1900', async () => {
    const tester = new BirthYearInputTester();

    // values greater than 100 are not transformed if less than 1900
    await tester.input.fill('101');
    await userEvent.tab();

    await expect.element(tester.formattedYear).toHaveTextContent('101');
    await expect.element(tester.parentFormValue).toHaveTextContent('101');
  });

  it('should transform value less than 100 and after current year', async () => {
    const tester = new BirthYearInputTester();

    // values less than 100 are transformed to the current century
    // if greater than the last two digits of the current year
    const lastTwoDigitsOfTheCurrentYear = new Date().getFullYear() % 100;
    await tester.input.fill(`${lastTwoDigitsOfTheCurrentYear + 1}`);
    await userEvent.tab();

    // then it should be a value in the past century
    const computedYearInPastCentury = (Math.floor(new Date().getFullYear() / 100) - 1) * 100 + lastTwoDigitsOfTheCurrentYear + 1;

    await expect.element(tester.formattedYear).toHaveTextContent(`${computedYearInPastCentury}`);
    await expect.element(tester.parentFormValue).toHaveTextContent(`${computedYearInPastCentury}`);
  });

  it('should transform value less than 100 and before current year', async () => {
    const tester = new BirthYearInputTester();

    // if less than or equal to the last two digits of the current year
    const lastTwoDigitsOfTheCurrentYear = new Date().getFullYear() % 100;
    await tester.input.fill(`${lastTwoDigitsOfTheCurrentYear}`);
    await userEvent.tab();

    // then it should be a value in the current century
    const computedYearInCurrentCentury = Math.floor(new Date().getFullYear() / 100) * 100 + lastTwoDigitsOfTheCurrentYear;

    await expect.element(tester.formattedYear).toHaveTextContent(`${computedYearInCurrentCentury}`);
    await expect.element(tester.parentFormValue).toHaveTextContent(`${computedYearInCurrentCentury}`);
  });

  it('should propagate null when the value is cleared', async () => {
    const tester = new BirthYearInputTester();

    // start with initial value 1982
    await expect.element(tester.parentFormValue).toHaveTextContent('1982');

    // clear the input
    await tester.input.fill('');
    await userEvent.tab();

    // the form value should be null
    await expect.element(tester.parentFormValue).toHaveTextContent('');
    expect(tester.fixture.componentInstance.form.birthYear().value()).toBeNull();
  });

  it('should have the is-invalid class if invalid', async () => {
    const tester = new BirthYearInputTester();

    await tester.input.fill('');
    await userEvent.tab();

    await expect.element(tester.input).toHaveClass('is-invalid');
  });

  it('should be disabled if the form control is disabled', async () => {
    const tester = new BirthYearInputTester();

    await expect.element(tester.input).not.toBeDisabled();

    tester.fixture.componentInstance.isDisabled.set(true);

    // the input should be disabled if the form control is disabled
    await expect.element(tester.input).toBeDisabled();
  });

  it('should mark the field as touched on blur', async () => {
    const tester = new BirthYearInputTester();

    const markAsTouched = vi.spyOn(tester.fixture.componentInstance.form.birthYear(), 'markAsTouched');
    await tester.input.click();
    await userEvent.tab();

    // it should have emitted the touch event on blur
    expect(markAsTouched).toHaveBeenCalledWith();
  });
});
