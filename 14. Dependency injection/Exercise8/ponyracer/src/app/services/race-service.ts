import { Injectable, signal } from '@angular/core';
import { RaceModel } from '../models/race-model';

@Injectable({
  providedIn: 'root'
})
export class RaceService {
  private readonly races = signal<Array<RaceModel>>([
    {
      id: 12,
      name: 'Paris',
      ponies: [
        { id: 1, name: 'Gentle Pie', color: 'YELLOW' },
        { id: 2, name: 'Big Soda', color: 'ORANGE' },
        { id: 3, name: 'Gentle Bottle', color: 'PURPLE' },
        { id: 4, name: 'Superb Whiskey', color: 'GREEN' },
        { id: 5, name: 'Fast Rainbow', color: 'BLUE' }
      ],
      startInstant: '2020-02-18T08:02:00Z'
    },
    {
      id: 13,
      name: 'Tokyo',
      ponies: [
        { id: 6, name: 'Fast Rainbow', color: 'BLUE' },
        { id: 7, name: 'Gentle Castle', color: 'GREEN' },
        { id: 8, name: 'Awesome Rock', color: 'PURPLE' },
        { id: 9, name: 'Little Rainbow', color: 'YELLOW' },
        { id: 10, name: 'Great Soda', color: 'ORANGE' }
      ],
      startInstant: '2020-02-18T08:03:00Z'
    },
    {
      id: 99,
      name: 'Nepal',
      ponies: [
        { id: 6, name: 'Shy Cone', color: 'YELLOW' },
        { id: 7, name: 'Flashy Flake', color: 'ORANGE' },
        { id: 8, name: 'Hot Ice', color: 'PURPLE' },
        { id: 9, name: 'Big T', color: 'BLUE' },
        { id: 10, name: 'Hype Hurricane', color: 'GREEN' }
      ],
      startInstant: '2027-02-18T08:03:00Z'
    }
  ]);

  getRaces(): Array<RaceModel> {
    return this.races();
  }

  getUpcomingRaces(): Array<RaceModel> {
    return this.races().filter(race => new Date(race.startInstant) > new Date());
  }
}
