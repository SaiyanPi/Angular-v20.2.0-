import { RaceModel } from './../models/race-model';
import { Component, inject } from '@angular/core';
import { Race } from '../race/race';
import { RaceService } from '../services/race-service';

@Component({
  selector: 'pr-races',
  imports: [Race],
  templateUrl: './races.html',
  styleUrl: './races.css'
})
export class Races {
  private readonly raceService = inject(RaceService);
  protected readonly races: Array<RaceModel> = this.raceService.list();
}
