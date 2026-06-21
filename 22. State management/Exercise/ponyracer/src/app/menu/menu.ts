import { Component, signal, ChangeDetectionStrategy, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { UserService } from '../services/user-service';
import { DecimalPipe } from '@angular/common';

@Component({
  selector: 'pr-menu',
  imports: [RouterLink, DecimalPipe],
  templateUrl: './menu.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './menu.css'
})
export class Menu {
  private readonly userService = inject(UserService);
  private readonly router = inject(Router);
  protected readonly navbarCollapsed = signal(true);
  protected readonly user = this.userService.currentUser;

  protected toggleNavbar(): void {
    this.navbarCollapsed.set(!this.navbarCollapsed());
  }

  protected logout(): void {
    this.userService.logout();
    this.router.navigateByUrl('/');
  }
}
