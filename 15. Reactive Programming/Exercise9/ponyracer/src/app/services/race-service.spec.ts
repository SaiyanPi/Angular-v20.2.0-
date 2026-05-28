import { TestBed } from '@angular/core/testing';
import { RaceModel } from '../models/race-model';
import { RaceService } from './race-service';

describe('RaceService', () => {
  let raceService: RaceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    raceService = TestBed.inject(RaceService);
    vi.useFakeTimers();
  });

  afterEach(() => vi.useRealTimers());

  it('should list races', () => {
    let fetchedRaces: Array<RaceModel> = [];
    raceService.list().subscribe((races: Array<RaceModel>) => (fetchedRaces = races));

    vi.advanceTimersByTime(200);

    expect(fetchedRaces, 'The service should return the races after a 500ms delay').toHaveLength(0);

    vi.advanceTimersByTime(400);

    expect(fetchedRaces, 'The service should return three races in an Observable for the `list()` method after 500ms').toHaveLength(3);
  });
});
