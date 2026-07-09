import { Component, signal, ChangeDetectionStrategy, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { UserService } from '../services/user-service';
import { DecimalPipe } from '@angular/common';
import { rxResource } from '@angular/core/rxjs-interop';
import { catchError, EMPTY, of, startWith } from 'rxjs';

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
  // protected readonly user = this.userService.currentUser;

  protected toggleNavbar(): void {
    // this.navbarCollapsed.set(!this.navbarCollapsed());
    this.navbarCollapsed.update(isCollapsed => !isCollapsed);
  }

  protected logout(): void {
    this.userService.logout();
    this.router.navigateByUrl('/');
  }

  protected readonly user = rxResource({
    params: () => this.userService.currentUser(),
    stream: ({ params: user }) => {
      return user ? this.userService.scoreUpdates(user.id)
      .pipe(startWith(user), catchError(() => EMPTY)) :
      of(undefined)
    }
  })
}
