import { Component, input } from '@angular/core';
import { RaceModel } from '../models/race-model';

@Component({
  selector: 'pr-race',
  imports: [],
  templateUrl: './race.html',
  styleUrl: './race.css'
})
export class Race {
  readonly raceModel = input.required<RaceModel>();
}
