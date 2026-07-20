import { rxResource } from '@angular/core/rxjs-interop';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { delay, of, throwError } from 'rxjs';
import { Mocked } from 'vitest';
import { page } from 'vitest/browser';
import { provideI18nTesting } from '../../../i18n-test-utils';
import { RaceModel } from '../../models/race-model';
import { RaceService } from '../../services/race-service';
import { PendingRaces } from './pending-races';

function mockRaceResource(races: Array<RaceModel>) {
  return () => rxResource({ stream: () => of(races).pipe(delay(5)) });
}

function mockRaceResourceError() {
  return () => rxResource({ stream: () => throwError(() => new Error('Oops')).pipe(delay(5)) });
}

class PendingRacesTester {
  readonly fixture = TestBed.createComponent(PendingRaces);
  readonly races = page.getByCss('pr-race');
  readonly betLinks = page.getByRole('link');
  readonly loading = page.getByRole('status');
  readonly alert = page.getByRole('alert');
}

describe('PendingRaces', () => {
  let raceService: Pick<Mocked<RaceService>, 'list'>;

  beforeEach(() => {
    raceService = { list: vi.fn().mockName('RaceService.list') };
    TestBed.configureTestingModule({
      providers: [provideI18nTesting(), provideRouter([]), { provide: RaceService, useValue: raceService }]
    });
    raceService.list.mockImplementation(
      mockRaceResource([
        { id: 1, name: 'Lyon', startInstant: '2024-02-18T08:02:00' },
        { id: 2, name: 'Los Angeles', startInstant: '2024-02-18T08:03:00' }
      ] as Array<RaceModel>)
    );
  });

  it('should display every race', async () => {
    const tester = new PendingRacesTester();

    await expect.element(tester.races).toHaveLength(2);
  });

  it('should display a loading message while races are loading', async () => {
    const tester = new PendingRacesTester();

    await expect.element(tester.loading).toBeVisible();
    await expect.element(tester.loading).toHaveTextContent('Loading.');
  });

  it('should display a link to bet on a race', async () => {
    const tester = new PendingRacesTester();

    await expect.element(tester.betLinks).toHaveLength(2);
    await expect.element(tester.betLinks.nth(0)).toHaveTextContent('Bet on Lyon');
    await expect.element(tester.betLinks.nth(0)).toHaveAttribute('href', '/races/1');

    await expect.element(tester.betLinks.nth(1)).toHaveTextContent('Bet on Los Angeles');
    await expect.element(tester.betLinks.nth(1)).toHaveAttribute('href', '/races/2');
  });

  it('should display an error message if loading races failed', async () => {
    raceService.list.mockImplementation(mockRaceResourceError());

    const tester = new PendingRacesTester();

    await expect.element(tester.alert).toBeVisible();
    await expect.element(tester.alert).toHaveTextContent('An error occurred while loading races.');
  });
});
