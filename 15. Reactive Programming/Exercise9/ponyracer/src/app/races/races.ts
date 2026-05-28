import { Component, inject } from '@angular/core';
import { Race } from '../race/race';
import { RaceService } from '../services/race-service';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'pr-races',
  imports: [Race],
  templateUrl: './races.html',
  styleUrl: './races.css'
})
export class Races {
  // private readonly raceService = inject(RaceService);
  // protected readonly races: Array<RaceModel> = this.raceService.list();
  protected readonly races = toSignal(inject(RaceService).list());
}
