import { Menu } from './menu/menu';
import { Component, inject } from '@angular/core';
import { Races } from './races/races';
import { Meta, Title } from '@angular/platform-browser';

@Component({
  selector: 'pr-root',
  imports: [Menu, Races],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  // protected readonly title = signal('ponyracer');

  // Chapter 14: DI/Built-in services
  constructor() {
    inject(Title).setTitle('PonyRacer - Bet on ponies');
    inject(Meta).addTag({ name: 'author', content: 'SaiyanPi' });
  }
}
