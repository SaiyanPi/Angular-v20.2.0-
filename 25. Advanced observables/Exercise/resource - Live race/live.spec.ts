import { DebugElement } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { delay, of, Subject } from 'rxjs';
import { Mocked } from 'vitest';
import { page } from 'vitest/browser';
import { LiveRaceModel, RaceModel } from '../models/race-model';
import { Pony } from '../pony/pony';
import { RaceService } from '../services/race-service';
import { Live } from './live';

function mockRaceResource(race: RaceModel) {
  return () => rxResource({ stream: () => of(race).pipe(delay(5)) });
}

class LiveTester {
  readonly fixture: ComponentFixture<unknown>;
  constructor(readonly harness: RouterTestingHarness) {
    this.fixture = harness.fixture;
  }

  readonly title = page.getByRole('heading', { level: 1 });
  readonly flag = page.getByCss('.fa-flag');
  readonly ponies = page.getByCss('pr-pony');
  readonly ponyWrappers = page.getByCss('.pony-wrapper');
  readonly alert = page.getByRole('alert');
}

describe('Live', () => {
  let raceService: Pick<Mocked<RaceService>, 'get' | 'live'>;
  const race = {
    id: 12,
    name: 'Lyon',
    status: 'PENDING',
    ponies: [],
    startInstant: '2024-02-18T08:02:00'
  } as RaceModel;

  beforeEach(() => {
    raceService = {
      get: vi.fn().mockName('RaceService.get'),
      live: vi.fn().mockName('RaceService.live')
    };
    TestBed.configureTestingModule({
      providers: [
        provideRouter([{ path: 'races/:raceId/live', component: Live }], withComponentInputBinding()),
        { provide: RaceService, useValue: raceService }
      ]
    });
  });

  it('should display the title', async () => {
    raceService.get.mockImplementation(mockRaceResource(race));
    raceService.live!.mockReturnValue(of({ ponies: [], status: 'RUNNING' }));
    const tester = new LiveTester(await RouterTestingHarness.create('/races/12/live'));

    await expect.element(tester.title).not.toBeInTheDocument();
    await expect.element(tester.ponies).toHaveLength(0);

    await expect.element(tester.title).toBeVisible();
    await expect.element(tester.title).toHaveTextContent('Lyon');
  });

  it('should subscribe to the live observable', async () => {
    raceService.get!.mockImplementation(mockRaceResource(race));
    raceService.live!.mockReturnValue(of({ ponies: [], status: 'RUNNING' }));
    const tester = new LiveTester(await RouterTestingHarness.create('/races/12/live'));

    await expect.element(tester.title).toHaveTextContent('Lyon');

    expect(raceService.live).toHaveBeenCalledWith(12);
  });

  it('should unsubscribe on destruction', async () => {
    raceService.get.mockImplementation(mockRaceResource(race));
    const liveRace = new Subject<LiveRaceModel>();
    raceService.live.mockReturnValue(liveRace);

    const tester = new LiveTester(await RouterTestingHarness.create('/races/12/live'));

    await expect.element(tester.title).toHaveTextContent('Lyon');
    expect(liveRace.observed, 'You need to subscribe to raceService.live when the component is created').toBe(true);

    tester.fixture.destroy();

    expect(liveRace.observed, 'You need to unsubscribe from raceService.live when the component is destroyed').toBe(false);
  });

  it('should display running ponies', async () => {
    raceService.get!.mockImplementation(mockRaceResource(race));
    raceService.live!.mockReturnValue(
      of({
        ponies: [
          { id: 1, name: 'Sunny Sunday', color: 'BLUE', position: 10 },
          { id: 2, name: 'Awesome Fridge', color: 'Green', position: 40 }
        ],
        status: 'RUNNING'
      })
    );
    const tester = new LiveTester(await RouterTestingHarness.create('/races/12/live'));

    await expect.element(tester.ponies).toHaveLength(2);

    tester.ponies.elements().forEach(el => {
      const pony = new DebugElement(el).componentInstance as Pony;

      expect(pony.isRunning(), 'The ponies should be running').toBe(true);
    });

    await expect.element(tester.ponyWrappers.nth(0)).toHaveStyle('margin-left: 5%');

    await expect.element(tester.ponyWrappers.nth(0)).toHaveStyle('transition: margin-left 1s linear');
  });
});
