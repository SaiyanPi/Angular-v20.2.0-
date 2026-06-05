import { TestBed } from '@angular/core/testing';
import { Mocked } from 'vitest';
import { page } from 'vitest/browser';
import { RaceModel } from '../models/race-model';
import { RaceService } from '../services/race-service';
import { Races } from './races';
import { of } from 'rxjs';

class RacesTester {
  readonly fixture = TestBed.createComponent(Races);
  readonly races = page.getByCss('pr-race');
}

describe('Races', () => {
  let raceService: Pick<Mocked<RaceService>, 'list'>;

  beforeEach(() => {
    raceService = { list: vi.fn().mockName('RaceService.list') };
    raceService.list.mockReturnValue(
      of([
        { id: 1, name: 'Tokyo', startInstant: '2024-02-18T08:03:00' },
        { id: 2, name: 'Paris', startInstant: '2024-02-18T08:04:00' },
        { id: 2, name: 'Nepal', startInstant: '2027-02-18T08:04:00' }
      ] as Array<RaceModel>)
    );
    TestBed.configureTestingModule({
      providers: [{ provide: RaceService, useValue: raceService }]
    });
  });

  it('should display every race', async () => {
    const tester = new RacesTester();

    await expect.element(tester.races).toHaveLength(3);
  });
});
