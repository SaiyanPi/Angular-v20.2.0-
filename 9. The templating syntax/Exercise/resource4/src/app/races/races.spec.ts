import { TestBed } from '@angular/core/testing';
import { page } from 'vitest/browser';
import { Races } from './races';

class RacesTester {
  readonly fixture = TestBed.createComponent(Races);
  readonly raceTitles = page.getByRole('heading', { level: 2 });
}

describe('Races', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should display every race', async () => {
    const tester = new RacesTester();

    await expect.element(tester.raceTitles).toHaveLength(2);
    await expect.element(tester.raceTitles.nth(0)).toHaveTextContent('Lyon');
    await expect.element(tester.raceTitles.nth(1)).toHaveTextContent('London');
  });
});
