import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ApplicationRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Subject } from 'rxjs';
import { environment } from '../../environments/environment';
import { LiveRaceModel, RaceModel } from '../models/race-model';
import { RaceService } from './race-service';
import { WsService } from './ws-service';

describe('RaceService', () => {
  let raceService: RaceService;
  let http: HttpTestingController;
  const wsService = { connect: vi.fn().mockName('WsService.connect') };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClientTesting(), { provide: WsService, useValue: wsService }]
    });
    raceService = TestBed.inject(RaceService);
    http = TestBed.inject(HttpTestingController);
  });

  afterAll(() => http.verify());

  it('should list races', async () => {
    // fake response
    const hardcodedRaces = [{ name: 'Paris' }, { name: 'Tokyo' }, { name: 'Lyon' }] as Array<RaceModel>;

    const actualRaces = TestBed.runInInjectionContext(() => raceService.list('PENDING'));
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

  it('should return a live race from websockets', () => {
    const raceId = 1;
    const messages = new Subject<LiveRaceModel>();
    let race: LiveRaceModel | undefined;

    wsService.connect!.mockReturnValue(messages);

    raceService.live(raceId).subscribe(liveRace => {
      race = liveRace;
    });

    expect(wsService.connect).toHaveBeenCalledWith(`/race/${raceId}`);

    messages.next({
      status: 'RUNNING',
      ponies: [
        {
          id: 1,
          name: 'Superb Runner',
          color: 'BLUE',
          position: 1,
          boosted: false
        }
      ]
    });

    expect(race!.status).toBe('RUNNING');
    expect(race!.ponies).toHaveLength(1);
    expect(race!.ponies[0].position).toBe(1);

    messages.next({
      status: 'FINISHED',
      ponies: [
        {
          id: 1,
          name: 'Superb Runner',
          color: 'BLUE',
          position: 100,
          boosted: false
        }
      ]
    });

    expect(race!.status).toBe('FINISHED');
    expect(race!.ponies[0].position).toBe(100);

    // we should not receive any more messages
    messages.next({
      status: 'FINISHED',
      ponies: [
        {
          id: 1,
          name: 'Superb Runner',
          color: 'BLUE',
          position: 101,
          boosted: false
        }
      ]
    });

    expect(race!.status).toBe('FINISHED');
    expect(race!.ponies[0].position).toBe(100);
  });

  it('should boost a pony in a race', () => {
    const ponyId = 12;
    const raceId = 1;

    let called = false;
    raceService.boost(raceId, ponyId).subscribe(() => (called = true));

    const req = http.expectOne({ method: 'POST', url: `${environment.baseUrl}/api/races/${raceId}/boosts` });

    expect(req.request.body).toStrictEqual({ ponyId });

    req.flush(null);

    expect(called).toBe(true);
  });
});
