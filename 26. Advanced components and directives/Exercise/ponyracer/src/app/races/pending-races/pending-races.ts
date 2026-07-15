import { Component, inject } from '@angular/core';
import { RaceService } from '../../services/race-service';
import { Race } from "../../race/race";
import { RouterLink } from '@angular/router';
import { Alert } from "../../alert/alert";

@Component({
  imports: [Race, RouterLink, Alert],
  templateUrl: './pending-races.html',
  styleUrl: './pending-races.css'
})
export class PendingRaces {
  protected readonly races = inject(RaceService).list('PENDING');
}
