import { Component, signal } from '@angular/core';
import { PonyModel } from '../models/pony-model';

@Component({
  selector: 'ns-ponies',
  standalone: true,
  template: `
  <button (click) = "refreshPonies()">Refresh</button>
  <ul>
    @for (pony of ponies(); track pony.id) {
      <li [style.color]="$even ? 'green' : 'black'">{{pony.name}}</li>
    }
  </ul>`,
  imports: [],
})
export class Ponies {
  protected readonly ponies = signal<PonyModel[]>([
    { id: 1, name: 'Rainbow Dash' },
    { id: 2, name: 'Pinkie Pie' }
  ]);
  // ESLint perfers PonyModel[] instead of Array<PonyModel>

  protected refreshPonies() {
    this.ponies.set([
      { id: 3, name: 'Twilight Sparkle' },
      { id: 4, name: 'Applejack' }
    ]);
  }
}
