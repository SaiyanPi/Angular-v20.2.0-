import { Component } from '@angular/core';
import { RouterLink, RouterOutlet, RouterLinkActive } from "@angular/router";
import { TranslocoDirective } from '@jsverse/transloco';

@Component({
  selector: 'pr-races',
  imports: [RouterLink, RouterOutlet, RouterLinkActive, TranslocoDirective],
  templateUrl: './races.html',
  styleUrl: './races.css'
})
export class Races {
  // // Since RhttpResource() returns a resource, the component no longer needs toSignal().
  // protected readonly races = inject(RaceService).list('PENDING');
}
