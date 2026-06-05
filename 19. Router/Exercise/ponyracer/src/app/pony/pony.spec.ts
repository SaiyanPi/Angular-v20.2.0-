import { inputBinding, outputBinding, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Locator, page } from 'vitest/browser';
import { PonyModel } from '../models/pony-model';
import { Pony } from './pony';

class PonyTester {
  readonly root: Locator;
  constructor(readonly fixture: ComponentFixture<Pony>) {
    this.root = page.elementLocator(fixture.nativeElement);
  }
  readonly figure = page.getByRole('figure');
  readonly image = page.getByRole('img');
  readonly legend = page.getByCss('figcaption');
}

describe('Pony', () => {
  const ponyModel = signal<PonyModel>({ id: 1, name: 'Fast Rainbow', color: 'PURPLE' });

  beforeEach(() => TestBed.configureTestingModule({}));

  it('should display an image and a legend', async () => {
    const tester = new PonyTester(
      TestBed.createComponent(Pony, {
        bindings: [inputBinding('ponyModel', ponyModel)]
      })
    );

    // then we should have an image and a legend
    await expect.element(tester.image).toBeVisible();
    await expect.element(tester.image).toHaveAttribute('src', 'images/pony-purple.gif');
    await expect.element(tester.image).toHaveAttribute('alt', 'Fast Rainbow');
    await expect.element(tester.legend).toHaveTextContent('Fast Rainbow');
  });

  it('should emit an event on click', async () => {
    const isPonySelected = signal(false);
    const tester = new PonyTester(
      TestBed.createComponent(Pony, {
        bindings: [inputBinding('ponyModel', ponyModel), outputBinding('ponySelected', () => isPonySelected.set(true))]
      })
    );

    // when we click on the element
    await expect.element(tester.figure).toBeVisible();
    expect(
      window.getComputedStyle(tester.figure.element()).getPropertyValue('padding-top'),
      'You must apply some styles to the `figure` element'
    ).toBe('3px');

    await tester.figure.click();

    expect(isPonySelected(), 'You may have forgotten the click handler on the `figure` element').toBe(true);
  });
});
