import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ApplicationRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
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

    http.expectOne('https://ponyracer.ninja-squad.com/api/races?status=PENDING').flush(hardcodedRaces);
    await TestBed.inject(ApplicationRef).whenStable();

    expect(actualRaces.value(), 'The `list` method should expose the races via the resource value').not.toHaveLength(0);
    expect(actualRaces.value()).toStrictEqual(hardcodedRaces);
  });
});
