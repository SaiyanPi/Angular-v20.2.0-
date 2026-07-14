import { Component, inject } from '@angular/core';
import { RaceService } from '../../services/race-service';
import { Race } from "../../race/race";
import { RouterLink } from '@angular/router';

@Component({
  imports: [Race, RouterLink],
  templateUrl: './pending-races.html',
  styleUrl: './pending-races.css'
})
export class PendingRaces {
  protected readonly races = inject(RaceService).list('PENDING');
}
