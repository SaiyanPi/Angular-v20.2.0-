import { DebugElement } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { delay, of, Subject } from 'rxjs';
import { Mocked } from 'vitest';
import { page } from 'vitest/browser';
import { provideI18nTesting } from '../../i18n-test-utils';
import { PonyWithPositionModel } from '../models/pony-model';
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
  readonly pendingMessage = page.getByText('The race will start');
  readonly raceOverMessage = page.getByText('The race is over.');
  readonly firstPonyFigure = this.ponies.nth(0).getByCss('figure');
  readonly secondPonyFigure = this.ponies.nth(1).getByCss('figure');
}

describe('Live', () => {
  let raceService: Pick<Mocked<RaceService>, 'get' | 'live' | 'boost'>;
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
      live: vi.fn().mockName('RaceService.live'),
      boost: vi.fn().mockName('RaceService.boost')
    };
    TestBed.configureTestingModule({
      providers: [
        provideI18nTesting(),
        provideRouter([{ path: 'races/:raceId/live', component: Live }], withComponentInputBinding()),
        { provide: RaceService, useValue: raceService }
      ]
    });
  });

  it('should change the race status once the race is RUNNING', async () => {
    raceService.get.mockImplementation(mockRaceResource(race));
    const liveRace = new Subject<LiveRaceModel>();
    raceService.live.mockReturnValue(liveRace);

    const tester = new LiveTester(await RouterTestingHarness.create('/races/12/live'));

    await expect.element(tester.title).not.toBeInTheDocument();
    await expect.element(tester.ponies).toHaveLength(0);

    await expect.element(tester.title).toHaveTextContent('Lyon');

    // there is no flag displayed as the race is PENDING
    await expect.element(tester.flag).not.toBeInTheDocument();

    liveRace.next({
      status: 'RUNNING',
      ponies: [
        {
          id: 1,
          name: 'Sunny Sunday',
          color: 'BLUE',
          position: 0,
          boosted: false
        }
      ]
    });

    // there is a flag displayed as the race is RUNNING
    await expect.element(tester.flag).toBeVisible();

    expect(raceService.get).toHaveBeenCalledWith(expect.any(Function));

    const raceId = raceService.get.mock.lastCall!.at(0)!;

    expect(raceId()).toBe(12);
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

  it('should display the pending race', async () => {
    raceService.get.mockImplementation(
      mockRaceResource({
        ...race,
        ponies: [
          { id: 1, name: 'Sunny Sunday', color: 'BLUE' },
          { id: 2, name: 'Pinkie Pie', color: 'GREEN' },
          { id: 3, name: 'Awesome Fridge', color: 'YELLOW' }
        ]
      })
    );
    const liveRace = new Subject<LiveRaceModel>();
    raceService.live.mockReturnValue(liveRace);

    const tester = new LiveTester(await RouterTestingHarness.create('/races/12/live'));

    await expect.element(tester.title).toHaveTextContent('Lyon');
    await expect.element(tester.pendingMessage).toBeVisible();

    await expect.element(tester.ponies).toHaveLength(3);

    tester.ponies.elements().forEach(el => {
      const pony = new DebugElement(el).componentInstance as Pony;

      expect(pony.isRunning(), 'The ponies should not be running').toBe(false);
    });
  });

  it('should display the running race', async () => {
    raceService.get.mockImplementation(
      mockRaceResource({
        ...race,
        status: 'RUNNING',
        ponies: [
          { id: 1, name: 'Sunny Sunday', color: 'BLUE' },
          { id: 2, name: 'Pinkie Pie', color: 'GREEN' },
          { id: 3, name: 'Awesome Fridge', color: 'YELLOW' }
        ]
      })
    );
    const liveRace = new Subject<LiveRaceModel>();
    raceService.live.mockReturnValue(liveRace);

    const tester = new LiveTester(await RouterTestingHarness.create('/races/12/live'));

    await expect.element(tester.title).toHaveTextContent('Lyon');

    liveRace.next({
      status: 'RUNNING',
      ponies: [
        {
          id: 1,
          name: 'Sunny Sunday',
          color: 'BLUE',
          position: 10,
          boosted: false
        },
        {
          id: 2,
          name: 'Pinkie Pie',
          color: 'GREEN',
          position: 10,
          boosted: false
        },
        {
          id: 3,
          name: 'Awesome Fridge',
          color: 'YELLOW',
          position: 9,
          boosted: false
        }
      ]
    });

    await expect.element(tester.ponies).toHaveLength(3);

    tester.ponies.elements().forEach(el => {
      const pony = new DebugElement(el).componentInstance as Pony;

      expect(pony.isRunning(), 'The ponies should be running').toBe(true);
    });

    await expect.element(tester.ponyWrappers.nth(0)).toHaveStyle('margin-left: 5%');

    await expect.element(tester.ponyWrappers.nth(0)).toHaveStyle('transition: margin-left 1s linear');
  });

  it('should display the finished race', async () => {
    raceService.get.mockImplementation(
      mockRaceResource({
        ...race,
        ponies: [
          { id: 1, name: 'Sunny Sunday', color: 'BLUE' },
          { id: 2, name: 'Pinkie Pie', color: 'GREEN' },
          { id: 3, name: 'Awesome Fridge', color: 'YELLOW' }
        ],
        betPonyId: 1
      })
    );
    const liveRace = new Subject<LiveRaceModel>();
    raceService.live.mockReturnValue(liveRace);

    const tester = new LiveTester(await RouterTestingHarness.create('/races/12/live'));

    await expect.element(tester.title).toHaveTextContent('Lyon');

    liveRace.next({
      status: 'FINISHED',
      ponies: [
        {
          id: 1,
          name: 'Sunny Sunday',
          color: 'BLUE',
          position: 101,
          boosted: false
        },
        {
          id: 2,
          name: 'Pinkie Pie',
          color: 'GREEN',
          position: 100,
          boosted: false
        },
        {
          id: 3,
          name: 'Awesome Fridge',
          color: 'YELLOW',
          position: 9,
          boosted: false
        }
      ]
    });
    liveRace.complete();

    // won the bet!
    await expect.element(tester.ponies).toHaveLength(2);

    tester.ponies.elements().forEach(el => {
      const pony = new DebugElement(el).componentInstance as Pony;

      expect(pony.isRunning(), 'The ponies should not be running').toBe(false);
    });

    await expect.element(tester.alert).toHaveTextContent('You won your bet!');
    await expect.element(tester.alert).toHaveClass('alert-success');
  });

  it('should display a message when the race is lost', async () => {
    raceService.get.mockImplementation(
      mockRaceResource({
        ...race,
        ponies: [
          { id: 1, name: 'Sunny Sunday', color: 'BLUE' },
          { id: 2, name: 'Pinkie Pie', color: 'GREEN' },
          { id: 3, name: 'Awesome Fridge', color: 'YELLOW' }
        ],
        betPonyId: 3
      })
    );
    const liveRace = new Subject<LiveRaceModel>();
    raceService.live.mockReturnValue(liveRace);

    const tester = new LiveTester(await RouterTestingHarness.create('/races/12/live'));

    await expect.element(tester.title).toHaveTextContent('Lyon');

    liveRace.next({
      status: 'FINISHED',
      ponies: [
        {
          id: 1,
          name: 'Sunny Sunday',
          color: 'BLUE',
          position: 101,
          boosted: false
        },
        {
          id: 2,
          name: 'Pinkie Pie',
          color: 'GREEN',
          position: 100,
          boosted: false
        },
        {
          id: 3,
          name: 'Awesome Fridge',
          color: 'YELLOW',
          position: 9,
          boosted: false
        }
      ]
    });
    liveRace.complete();

    // lost the bet...
    await expect.element(tester.alert).toHaveTextContent('You lost your bet.');
    await expect.element(tester.alert).toHaveClass('alert-warning');
  });

  it('should display a message when the race is over', async () => {
    raceService.get.mockImplementation(
      mockRaceResource({
        ...race,
        ponies: [
          { id: 1, name: 'Sunny Sunday', color: 'BLUE' },
          { id: 2, name: 'Pinkie Pie', color: 'GREEN' },
          { id: 3, name: 'Awesome Fridge', color: 'YELLOW' }
        ],
        status: 'FINISHED'
      })
    );

    const tester = new LiveTester(await RouterTestingHarness.create('/races/12/live'));

    // race is over
    await expect.element(tester.raceOverMessage).toBeVisible();
  });

  it('should display a message when an error occurred', async () => {
    raceService.get.mockImplementation(
      mockRaceResource({
        ...race,
        ponies: [
          { id: 1, name: 'Sunny Sunday', color: 'BLUE' },
          { id: 2, name: 'Pinkie Pie', color: 'GREEN' },
          { id: 3, name: 'Awesome Fridge', color: 'YELLOW' }
        ],
        betPonyId: 1
      })
    );
    const liveRace = new Subject<LiveRaceModel>();
    raceService.live.mockReturnValue(liveRace);

    const tester = new LiveTester(await RouterTestingHarness.create('/races/12/live'));

    // an error occurred
    liveRace.error(new Error('oops'));

    await expect.element(tester.alert).toHaveTextContent('A problem occurred during the live.');
    await expect.element(tester.alert).toHaveClass('alert-danger');
  });

  describe('with boost', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should buffer clicks over a second and call the boost method', async () => {
      const pony: PonyWithPositionModel = {
        id: 1,
        name: 'Sunny Sunday',
        color: 'BLUE',
        position: 10,
        boosted: false
      };
      raceService.get.mockImplementation(mockRaceResource({ ...race, status: 'RUNNING', ponies: [pony] }));
      raceService.boost.mockReturnValue(of(undefined));
      raceService.live.mockReturnValue(of({ status: 'RUNNING', ponies: [pony] }));

      const tester = new LiveTester(await RouterTestingHarness.create('/races/12/live'));

      // await vi.advanceTimersByTimeAsync(5);
      await vi.advanceTimersByTimeAsync(50);
      await tester.fixture.whenStable();
      tester.fixture.detectChanges();

      await expect.element(tester.ponies).toHaveLength(1);
      await expect.element(tester.firstPonyFigure).toBeVisible();

      // when 5 clicks are emitted in a second
      await tester.firstPonyFigure.click();
      await tester.firstPonyFigure.click();
      await tester.firstPonyFigure.click();
      await tester.firstPonyFigure.click();
      await tester.firstPonyFigure.click();
      await tester.firstPonyFigure.click();

      await vi.advanceTimersByTimeAsync(1000);

      // then we should call the boost method
      expect(raceService.boost).toHaveBeenCalledWith(race.id, pony.id);

      raceService.boost.mockClear();

      // when 5 clicks are emitted over 2 seconds
      await tester.firstPonyFigure.click();
      await tester.firstPonyFigure.click();
      await tester.firstPonyFigure.click();
      await vi.advanceTimersByTimeAsync(1000);
      await tester.firstPonyFigure.click();
      await tester.firstPonyFigure.click();
      await vi.advanceTimersByTimeAsync(1000);

      // then we should not call the boost method
      expect(raceService.boost).not.toHaveBeenCalled();
    });

    it('should filter click buffer that are not at least 5', async () => {
      const pony: PonyWithPositionModel = {
        id: 1,
        name: 'Sunny Sunday',
        color: 'BLUE',
        position: 10,
        boosted: false
      };
      const pony2: PonyWithPositionModel = {
        id: 2,
        name: 'Black Friday',
        color: 'GREEN',
        position: 11,
        boosted: false
      };
      raceService.get.mockImplementation(mockRaceResource({ ...race, status: 'RUNNING', ponies: [pony, pony2] }));
      raceService.boost.mockReturnValue(of(undefined));
      raceService.live.mockReturnValue(of({ status: 'RUNNING', ponies: [pony, pony2] }));

      const tester = new LiveTester(await RouterTestingHarness.create('/races/12/live'));

      // await vi.advanceTimersByTimeAsync(5);
      await vi.advanceTimersByTimeAsync(60);
      await tester.fixture.whenStable();
      tester.fixture.detectChanges();

      await expect.element(tester.ponies).toHaveLength(2);
      await expect.element(tester.firstPonyFigure).toBeVisible();

      // when 4 clicks are emitted in a second
      await tester.firstPonyFigure.click();
      await tester.firstPonyFigure.click();
      await tester.firstPonyFigure.click();
      await tester.firstPonyFigure.click();
      await vi.advanceTimersByTimeAsync(1000);

      // then we should not call the boost method
      expect(raceService.boost).not.toHaveBeenCalled();

      // when 5 clicks are emitted over a second on two ponies
      await tester.firstPonyFigure.click();
      await tester.secondPonyFigure.click();
      await tester.firstPonyFigure.click();
      await tester.secondPonyFigure.click();
      await tester.firstPonyFigure.click();
      await vi.advanceTimersByTimeAsync(1000);

      // then we should not call the boost method
      expect(raceService.boost).not.toHaveBeenCalled();
    });

    it('should throttle repeated boosts', async () => {
      const pony: PonyWithPositionModel = {
        id: 1,
        name: 'Sunny Sunday',
        color: 'BLUE',
        position: 10,
        boosted: false
      };
      raceService.get.mockImplementation(mockRaceResource({ ...race, status: 'RUNNING', ponies: [pony] }));
      raceService.boost.mockReturnValue(of(undefined));
      raceService.live.mockReturnValue(of({ status: 'RUNNING', ponies: [pony] }));

      const tester = new LiveTester(await RouterTestingHarness.create('/races/12/live'));

      // await vi.advanceTimersByTimeAsync(5);
      await vi.advanceTimersByTimeAsync(50);
      await tester.fixture.whenStable();
      tester.fixture.detectChanges();

      await expect.element(tester.ponies).toHaveLength(1);
      await expect.element(tester.firstPonyFigure).toBeVisible();

      // when 5 clicks are emitted in a second
      await tester.firstPonyFigure.click();
      await tester.firstPonyFigure.click();
      await vi.advanceTimersByTimeAsync(800);
      await tester.firstPonyFigure.click();
      await tester.firstPonyFigure.click();
      await tester.firstPonyFigure.click();
      await vi.advanceTimersByTimeAsync(200);

      // then we should call the boost method
      expect(raceService.boost).toHaveBeenCalledWith(12, 1);

      raceService.boost.mockClear();

      // when 2 other clicks are emitted
      await tester.firstPonyFigure.click();
      await tester.firstPonyFigure.click();
      await vi.advanceTimersByTimeAsync(800);

      // then we should not call the boost method with the throttling
      expect(raceService.boost).not.toHaveBeenCalled();

      await tester.firstPonyFigure.click();
      await tester.firstPonyFigure.click();
      await tester.firstPonyFigure.click();
      await vi.advanceTimersByTimeAsync(200);

      // we should call it a bit later
      expect(raceService.boost).toHaveBeenCalledWith(12, 1);
    });

    it('should catch a boost error', async () => {
      const pony: PonyWithPositionModel = {
        id: 1,
        name: 'Sunny Sunday',
        color: 'BLUE',
        position: 10,
        boosted: false
      };
      raceService.get.mockImplementation(mockRaceResource({ ...race, status: 'RUNNING', ponies: [pony] }));
      const boost = new Subject<void>();
      raceService.boost.mockReturnValue(boost);
      raceService.live.mockReturnValue(of({ status: 'RUNNING', ponies: [pony] }));

      const tester = new LiveTester(await RouterTestingHarness.create('/races/12/live'));

      // await vi.advanceTimersByTimeAsync(5);
      await vi.advanceTimersByTimeAsync(50);
      await tester.fixture.whenStable();
      tester.fixture.detectChanges();

      await expect.element(tester.ponies).toHaveLength(1);
      await expect.element(tester.firstPonyFigure).toBeVisible();

      // when 5 clicks are emitted in a second
      await tester.firstPonyFigure.click();
      await tester.firstPonyFigure.click();
      await tester.firstPonyFigure.click();
      await tester.firstPonyFigure.click();
      await tester.firstPonyFigure.click();
      await vi.advanceTimersByTimeAsync(1000);

      // then we should call the boost method
      expect(raceService.boost).toHaveBeenCalledWith(12, 1);

      raceService.boost.mockClear();

      boost.error('You should catch a potential error from the boost method with a `catch` operator');

      // when 5 other clicks are emitted
      await tester.firstPonyFigure.click();
      await tester.firstPonyFigure.click();
      await tester.firstPonyFigure.click();
      await tester.firstPonyFigure.click();
      await tester.firstPonyFigure.click();
      await vi.advanceTimersByTimeAsync(1000);

      // we should call it again if the previous error has been handled
      expect(raceService.boost).toHaveBeenCalledWith(12, 1);
    });
  });
});
