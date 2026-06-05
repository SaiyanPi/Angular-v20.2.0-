import { Component, input } from '@angular/core';
import { RaceModel } from '../models/race-model';
import { Pony } from '../pony/pony';
import { PrettyDatePipe } from '../shared/pipes/pretty-date-pipe';

@Component({
  selector: 'pr-race',
  imports: [Pony, PrettyDatePipe],
  templateUrl: './race.html',
  styleUrl: './race.css'
})
export class Race {
  readonly raceModel = input.required<RaceModel>();
}
