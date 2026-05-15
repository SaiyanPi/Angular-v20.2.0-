import { Component, signal } from '@angular/core';
import { Ponies } from './ponies/ponies/ponies';

@Component({
  selector: 'ns-root',
  imports: [Ponies],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('ponyracer');
}
