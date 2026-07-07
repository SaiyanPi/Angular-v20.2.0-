import { Component, inject } from '@angular/core';
import { Race } from '../race/race';
import { RaceService } from '../services/race-service';
import { RouterLink } from "@angular/router";

@Component({
  selector: 'pr-races',
  imports: [Race, RouterLink],
  templateUrl: './races.html',
  styleUrl: './races.css'
})
export class Races {
  // Since RhttpResource() returns a resource, the component no longer needs toSignal().
  protected readonly races = inject(RaceService).list();
}
