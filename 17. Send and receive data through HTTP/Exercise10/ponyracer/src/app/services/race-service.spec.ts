import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
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

  it('should list races', () => {
    // fake response
    const hardcodedRaces = [{ name: 'Paris' }, { name: 'Tokyo' }, { name: 'Lyon' }] as Array<RaceModel>;

    let actualRaces: Array<RaceModel> = [];
    raceService.list().subscribe((races: Array<RaceModel>) => (actualRaces = races));

    http.expectOne('https://ponyracer.ninja-squad.com/api/races?status=PENDING').flush(hardcodedRaces);

    expect(actualRaces, 'The `list` method should return an array of RaceModel wrapped in an Observable').not.toHaveLength(0);
    expect(actualRaces).toStrictEqual(hardcodedRaces);
  });
});
