import { rxResource } from '@angular/core/rxjs-interop';
import { TestBed } from '@angular/core/testing';
import { delay, of, throwError } from 'rxjs';
import { Mocked } from 'vitest';
import { page } from 'vitest/browser';
import { RaceModel } from '../models/race-model';
import { RaceService } from '../services/race-service';
import { Races } from './races';

function mockRaceResource(races: Array<RaceModel>) {
  return () => rxResource({ stream: () => of(races).pipe(delay(5)) });
}

function mockRaceResourceError() {
  return () => rxResource({ stream: () => throwError(() => new Error('Oops')).pipe(delay(5)) });
}

class RacesTester {
  readonly fixture = TestBed.createComponent(Races);
  readonly races = page.getByCss('pr-race');
  readonly loading = page.getByRole('status');
  readonly alert = page.getByRole('alert');
}

describe('Races', () => {
  let raceService: Pick<Mocked<RaceService>, 'list'>;

  beforeEach(() => {
    raceService = { list: vi.fn().mockName('RaceService.list') };
    TestBed.configureTestingModule({
      providers: [{ provide: RaceService, useValue: raceService }]
    });
    raceService.list.mockImplementation(
      mockRaceResource([
        { id: 1, name: 'Tokyo', startInstant: '2024-02-18T08:03:00' },
        { id: 2, name: 'Paris', startInstant: '2024-02-18T08:04:00' }
      ] as Array<RaceModel>)
    );
  });

  it('should display every race', async () => {
    const tester = new RacesTester();

    await expect.element(tester.races).toHaveLength(2);
  });

  it('should display a loading message while races are loading', async () => {
    const tester = new RacesTester();

    await expect.element(tester.loading).toBeVisible();
    await expect.element(tester.loading).toHaveTextContent('Loading.');
  });

  it('should display an error message if loading races failed', async () => {
    raceService.list.mockImplementation(mockRaceResourceError());

    const tester = new RacesTester();

    await expect.element(tester.alert).toBeVisible();
    await expect.element(tester.alert).toHaveTextContent('An error occurred while loading races.');
  });
});
