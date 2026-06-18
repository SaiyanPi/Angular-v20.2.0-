import { Component, signal, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'pr-menu',
  imports: [RouterLink],
  templateUrl: './menu.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './menu.css'
})
export class Menu {
  // Exercise 3: add a signal navbarCollapsed in the component, initialized to true.
  protected readonly navbarCollapsed = signal(true);

  protected toggleNavbar(): void {
    // Exercise 3: flip the value of the navbarCollapsed signal.
    this.navbarCollapsed.set(!this.navbarCollapsed());
  }
}
