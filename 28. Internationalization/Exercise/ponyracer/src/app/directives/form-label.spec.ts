import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { form, FormField, required } from '@angular/forms/signals';
import { By } from '@angular/platform-browser';
import { page, userEvent } from 'vitest/browser';
import { FormLabel } from './form-label';

@Component({
  selector: 'pr-form',
  template: `
    <label [prFormLabel]="userForm.name" for="name" class="form-label">Name</label>
    <input id="name" [formField]="userForm.name" />
  `,
  imports: [FormField, FormLabel]
})
class Form {
  readonly userForm = form(signal({ name: 'Jane' }), f => {
    required(f.name);
  });
}

class FormLabelTester {
  readonly fixture = TestBed.createComponent(Form);
  readonly label = page.getByText('Name');
  readonly input = page.getByLabelText('Name');
}

describe('FormLabel', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should add the text-danger CSS class to the label if invalid', async () => {
    const tester = new FormLabelTester();

    await expect.element(tester.label).toBeVisible();
    await expect.element(tester.label).not.toHaveClass('text-danger');

    const directive = tester.fixture.debugElement.query(By.directive(FormLabel));

    expect(directive, 'The directive should be applied to a label with an attribute prFormLabel').not.toBeNull();

    // make the field touched and invalid
    await tester.input.fill('');
    await userEvent.tab();

    await expect.element(tester.label).toHaveClass('text-danger');

    // make the field valid
    await tester.input.fill('Jane');

    await expect.element(tester.label).not.toHaveClass('text-danger');
  });
});
