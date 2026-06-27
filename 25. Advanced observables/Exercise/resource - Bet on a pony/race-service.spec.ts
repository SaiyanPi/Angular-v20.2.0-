import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ApplicationRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../environments/environment';
import { RaceModel } from '../models/race-model';
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
});
