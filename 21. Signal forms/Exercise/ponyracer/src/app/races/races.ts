import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { Race } from '../race/race';
import { RaceService } from '../services/race-service';

@Component({
  selector: 'pr-races',
  imports: [Race],
  templateUrl: './races.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './races.css'
})
export class Races {
  // Since RhttpResource() returns a resource, the component no longer needs toSignal().
  protected readonly races = inject(RaceService).list();
}
