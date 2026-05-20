import { TestBed } from '@angular/core/testing';
import { page } from 'vitest/browser';
import { Races } from './races';

class RacesTester {
  readonly fixture = TestBed.createComponent(Races);
  readonly races = page.getByCss('pr-race');
}

describe('Races', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should display every race', async () => {
    const tester = new RacesTester();

    await expect.element(tester.races).toHaveLength(2);
  });
});
