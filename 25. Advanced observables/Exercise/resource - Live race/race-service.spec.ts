import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ApplicationRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../environments/environment';
import { LiveRaceModel, RaceModel } from '../models/race-model';
import { RaceService } from './race-service';

describe('RaceService', () => {
  let raceService: RaceService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClientTesting()]
    });
    raceService = TestBed.inject(RaceService);
    http = TestBed.inject(HttpTestingController);
  });

  afterAll(() => http.verify());

  it('should list races', async () => {
    // fake response
    const hardcodedRaces = [{ name: 'Paris' }, { name: 'Tokyo' }, { name: 'Lyon' }] as Array<RaceModel>;

    const actualRaces = TestBed.runInInjectionContext(() => raceService.list());
    TestBed.tick();

    http.expectOne(`${environment.baseUrl}/api/races?status=PENDING`).flush(hardcodedRaces);
    await TestBed.inject(ApplicationRef).whenStable();

    expect(actualRaces.value(), 'The `list` method should expose the races via the resource value').not.toHaveLength(0);
    expect(actualRaces.value()).toStrictEqual(hardcodedRaces);
  });

  it('should get a race', async () => {
    // fake response
    const race = { name: 'Paris' } as RaceModel;
    const raceId = 1;

    const actualRace = TestBed.runInInjectionContext(() => raceService.get(() => raceId));
    TestBed.tick();

    http.expectOne(`${environment.baseUrl}/api/races/${raceId}`).flush(race);
    await TestBed.inject(ApplicationRef).whenStable();

    expect(actualRace.value(), 'The `get` method should expose the race via the resource value').toBe(race);
  });

  it('should bet on a race', () => {
    // fake response
    const race = { name: 'Paris' } as RaceModel;
    const raceId = 1;
    const ponyId = 2;

    let called = false;
    raceService.bet(raceId, ponyId).subscribe(() => (called = true));

    const req = http.expectOne({ method: 'POST', url: `${environment.baseUrl}/api/races/${raceId}/bets` });

    expect(req.request.body).toStrictEqual({ ponyId });

    req.flush(race);

    expect(called).toBe(true);
  });

  it('should cancel a bet on a race', () => {
    const raceId = 1;

    let called = false;
    raceService.cancelBet(raceId).subscribe(() => (called = true));

    http.expectOne({ method: 'DELETE', url: `${environment.baseUrl}/api/races/${raceId}/bets` }).flush(null);

    expect(called).toBe(true);
  });

  it('should return a live race every second', () => {
    vi.useFakeTimers();
    const raceId = 1;
    let race: LiveRaceModel | undefined;
    let counter = 0;

    raceService.live(raceId).subscribe(liveRace => {
      race = liveRace;
      counter++;
    });

    expect(race, 'The observable should only emit after 1 second').toBeUndefined();

    // emulates the 1 second delay
    vi.advanceTimersByTime(1000);

    expect(race, 'The observable should have emitted after a 1 second interval').toBeDefined();
    expect(race!.ponies, 'The observable should have emitted after a 1 second interval').toHaveLength(5);

    let position = race!.ponies[0];

    expect(position).toStrictEqual({
      id: 1,
      name: 'Superb Runner',
      color: 'BLUE',
      position: 0
    });

    vi.advanceTimersByTime(1000);

    expect(race!.ponies).toHaveLength(5);

    position = race!.ponies[1];

    expect(position).toStrictEqual({
      id: 2,
      name: 'Awesome Fridge',
      color: 'GREEN',
      position: 1
    });

    // emulates the 100 seconds of the race
    while (counter < 100) {
      vi.advanceTimersByTime(1000);
    }

    position = race!.ponies[2];

    expect(position).toStrictEqual({
      id: 3,
      name: 'Great Bottle',
      color: 'ORANGE',
      position: 99
    });

    vi.advanceTimersByTime(1000);

    position = race!.ponies[3];

    expect(position).toStrictEqual({
      id: 4,
      name: 'Little Flower',
      color: 'YELLOW',
      position: 100
    });

    vi.advanceTimersByTime(1000);

    position = race!.ponies[4];

    expect(position).toStrictEqual({
      id: 5,
      name: 'Nice Rock',
      color: 'PURPLE',
      position: 100
    });

    vi.useRealTimers();
  });
});
