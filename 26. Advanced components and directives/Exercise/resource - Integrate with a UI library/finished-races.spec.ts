import { rxResource } from '@angular/core/rxjs-interop';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { delay, of, throwError } from 'rxjs';
import { Mocked } from 'vitest';
import { page } from 'vitest/browser';
import { RaceModel } from '../../models/race-model';
import { RaceService } from '../../services/race-service';
import { FinishedRaces } from './finished-races';

class FinishedRacesTester {
  constructor(readonly harness: RouterTestingHarness) {}
  readonly races = page.getByCss('pr-race');
  readonly loading = page.getByRole('status');
  readonly alert = page.getByRole('alert');
  readonly pagination = page.getByRole('navigation');
  readonly pageLinks = this.pagination.getByRole('link');
  readonly activePageLink = this.pagination.getByCss('.page-item.active a');
}

const races = [
  { id: 1, name: 'Lyon', startInstant: '2024-02-18T08:02:00Z' },
  { id: 2, name: 'Los Angeles', startInstant: '2024-02-18T08:03:00Z' },
  { id: 3, name: 'Sydney', startInstant: '2024-02-18T08:04:00Z' },
  { id: 4, name: 'Tokyo', startInstant: '2024-02-18T08:05:00Z' },
  { id: 5, name: 'Casablanca', startInstant: '2024-02-18T08:06:00Z' },
  { id: 6, name: 'Paris', startInstant: '2024-02-18T08:07:00Z' },
  { id: 7, name: 'London', startInstant: '2024-02-18T08:08:00Z' },
  { id: 8, name: 'Madrid', startInstant: '2024-02-18T08:09:00Z' },
  { id: 9, name: 'Lima', startInstant: '2024-02-18T08:10:00Z' },
  { id: 10, name: 'Bali', startInstant: '2024-02-18T08:11:00Z' },
  { id: 11, name: 'Berlin', startInstant: '2024-02-18T08:12:00Z' },
  { id: 12, name: 'Moscow', startInstant: '2024-02-18T08:13:00Z' }
] as Array<RaceModel>;

function mockRaceResource(races: Array<RaceModel>) {
  return () => rxResource({ stream: () => of(races).pipe(delay(5)) });
}

function mockRaceResourceError() {
  return () => rxResource({ stream: () => throwError(() => new Error('Oops')).pipe(delay(5)) });
}

describe('FinishedRaces', () => {
  let raceService: Pick<Mocked<RaceService>, 'list'>;

  beforeEach(() => {
    raceService = { list: vi.fn().mockName('RaceService.list') };
    TestBed.configureTestingModule({
      providers: [
        provideRouter([{ path: 'races/finished', component: FinishedRaces }], withComponentInputBinding()),
        { provide: RaceService, useValue: raceService }
      ]
    });
    raceService.list.mockImplementation(mockRaceResource(races));
  });

  it('should display the first page of races by default', async () => {
    const tester = new FinishedRacesTester(await RouterTestingHarness.create('/races/finished'));

    await expect.element(tester.races).toHaveLength(0);

    await expect.element(tester.races).toHaveLength(10);
    await expect.element(tester.races.nth(0)).toHaveTextContent('Lyon');

    await expect.element(tester.pagination).toBeVisible();
    await expect.element(tester.pageLinks).toHaveLength(4);
    await expect.element(tester.activePageLink).toHaveTextContent('1');
  });

  it('should display the second page of races if page query param is 2', async () => {
    const tester = new FinishedRacesTester(await RouterTestingHarness.create('/races/finished?page=2'));

    await expect.element(tester.races).toHaveLength(2);
    await expect.element(tester.races.nth(0)).toHaveTextContent('Berlin');
    await expect.element(tester.activePageLink).toHaveTextContent('2');
  });

  it('should display a loading message while races are loading', async () => {
    const tester = new FinishedRacesTester(await RouterTestingHarness.create('/races/finished'));

    await expect.element(tester.loading).toBeVisible();
    await expect.element(tester.loading).toHaveTextContent('Loading.');
  });

  it('should navigate to the second page of races when clicking the button', async () => {
    const tester = new FinishedRacesTester(await RouterTestingHarness.create('/races/finished'));

    // click on link to page 2
    const page2Link = tester.pageLinks.nth(2);

    await expect.element(page2Link).toHaveTextContent('2');

    await page2Link.click();

    await expect.element(tester.races).toHaveLength(2);
    await expect.element(tester.activePageLink).toHaveTextContent('2');

    const router = TestBed.inject(Router);

    expect(router.parseUrl(router.url).queryParams['page']).toBe('2');
  });

  it('should not display a link to bet on a race', async () => {
    const tester = new FinishedRacesTester(await RouterTestingHarness.create('/races/finished'));

    await expect.element(tester.races).toHaveLength(10);

    await expect.element(page.getByCss('a:not(.page-link)')).toHaveLength(0);
  });

  it('should display an error message if loading races failed', async () => {
    raceService.list.mockImplementation(mockRaceResourceError());

    const tester = new FinishedRacesTester(await RouterTestingHarness.create('/races/finished'));

    await expect.element(tester.alert).toBeVisible();
    await expect.element(tester.alert).toHaveTextContent('An error occurred while loading races.');
  });
});
