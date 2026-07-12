import { Component, inject } from '@angular/core';
import { RaceService } from '../../services/race-service';
import { Race } from "../../race/race";

@Component({
  imports: [Race],
  templateUrl: './finished-races.html',
  styleUrl: './finished-races.css'
})
export class FinishedRaces {
  protected readonly races = inject(RaceService).list('FINISHED');
}
