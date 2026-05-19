import { inputBinding, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { page } from 'vitest/browser';
import { RaceModel } from '../models/race-model';
import { Race } from './race';

class RaceTester {
  constructor(readonly fixture: ComponentFixture<Race>) {}
  readonly title = page.getByRole('heading', { level: 2 });
  readonly ponies = page.getByCss('li');
}

describe('Race', () => {
  const raceModel = signal<RaceModel>({
    id: 12,
    name: 'Paris',
    ponies: [
      { id: 1, name: 'Gentle Pie', color: 'YELLOW' },
      { id: 2, name: 'Big Soda', color: 'ORANGE' },
      { id: 3, name: 'Gentle Bottle', color: 'PURPLE' },
      { id: 4, name: 'Superb Whiskey', color: 'GREEN' },
      { id: 5, name: 'Fast Rainbow', color: 'BLUE' }
    ],
    startInstant: '2024-02-18T08:02:00'
  });

  beforeEach(() => TestBed.configureTestingModule({}));

  it('should display a race name and its ponies', async () => {
    const tester = new RaceTester(
      TestBed.createComponent(Race, {
        bindings: [inputBinding('raceModel', raceModel)]
      })
    );

    // then we should have the name and ponies displayed in the template
    await expect.element(tester.title).toHaveTextContent('Paris');
    await expect.element(tester.ponies).toHaveLength(5);
    await expect.element(tester.ponies.nth(0)).toHaveTextContent('Gentle Pie');
    await expect.element(tester.ponies.nth(1)).toHaveTextContent('Big Soda');
    await expect.element(tester.ponies.nth(2)).toHaveTextContent('Gentle Bottle');
    await expect.element(tester.ponies.nth(3)).toHaveTextContent('Superb Whiskey');
    await expect.element(tester.ponies.nth(4)).toHaveTextContent('Fast Rainbow');
  });
});
