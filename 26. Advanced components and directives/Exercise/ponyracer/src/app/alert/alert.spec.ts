import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { page } from 'vitest/browser';
import { Alert } from './alert';

@Component({
  imports: [Alert],
  template: `<pr-alert [type]="type()" [dismissible]="dismissible()" (closed)="closed.set(true)">Hello</pr-alert>`
})
class AlertTest {
  readonly type = signal<'success' | 'danger' | 'warning'>('warning');
  readonly dismissible = signal(true);
  readonly closed = signal(false);
}

class AlertTester {
  readonly fixture = TestBed.createComponent(AlertTest);
  readonly rootDiv = page.getByRole('alert');
  readonly closeButton = page.getByRole('button');
}

describe('Alert', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should display a div with correct classes', async () => {
    const tester = new AlertTester();

    await expect.element(tester.rootDiv).toBeInTheDocument();
    await expect.element(tester.rootDiv).toHaveClass('alert');
    await expect.element(tester.rootDiv).toHaveClass('alert-warning');
    await expect.element(tester.rootDiv).toHaveClass('alert-dismissible');

    tester.fixture.componentInstance.dismissible.set(false);

    await expect.element(tester.rootDiv).not.toHaveClass('alert-dismissible');

    tester.fixture.componentInstance.dismissible.set(true);
    tester.fixture.componentInstance.type.set('danger');

    await expect.element(tester.rootDiv).toHaveClass('alert-danger');
    await expect.element(tester.rootDiv).not.toHaveClass('alert-warning');
    await expect.element(tester.rootDiv).toHaveClass('alert-dismissible');

    tester.fixture.componentInstance.type.set('success');

    await expect.element(tester.rootDiv).toHaveClass('alert-success');
    await expect.element(tester.rootDiv).not.toHaveClass('alert-danger');
    await expect.element(tester.rootDiv).toHaveClass('alert-dismissible');
  });

  it('should display the content', async () => {
    const tester = new AlertTester();

    await expect.element(tester.rootDiv).toHaveTextContent('Hello');
  });

  it('should display a button depending on dismissible input', async () => {
    const tester = new AlertTester();
    tester.fixture.componentInstance.dismissible.set(false);

    await expect.element(tester.closeButton).not.toBeInTheDocument();

    tester.fixture.componentInstance.dismissible.set(true);

    await expect.element(tester.closeButton).toBeInTheDocument();
  });

  it('should emit a close event', async () => {
    const tester = new AlertTester();

    await tester.closeButton.click();

    expect(tester.fixture.componentInstance.closed(), 'You should emit an event on close').toBe(true);
  });

  it('should have optional type and dismissible inputs', async () => {
    const tester = new AlertTester();

    // warning by default
    await expect.element(tester.rootDiv).toHaveClass('alert-warning');

    // dismissible by default
    await expect.element(tester.rootDiv).toHaveClass('alert-dismissible');
  });
});
