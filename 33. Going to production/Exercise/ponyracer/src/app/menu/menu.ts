import { Component, signal, inject, effect } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { UserService } from '../services/user-service';
import { DecimalPipe } from '@angular/common';
import { rxResource } from '@angular/core/rxjs-interop';
import { catchError, EMPTY, of, startWith } from 'rxjs';
import { NgbCollapse } from '@ng-bootstrap/ng-bootstrap';
import { I18nService } from '../services/i18n-service';
import { form, FormField } from '@angular/forms/signals';
import { TranslocoDirective } from '@jsverse/transloco';

@Component({
  selector: 'pr-menu',
  imports: [RouterLink, DecimalPipe, NgbCollapse, FormField, TranslocoDirective],
  templateUrl: './menu.html',
  styleUrl: './menu.css'
})
export class Menu {
  private readonly userService = inject(UserService);
  private readonly router = inject(Router);
  protected readonly navbarCollapsed = signal(true);
  // protected readonly user = this.userService.currentUser;

  private readonly i18nService = inject(I18nService);
  protected readonly availableLangs = this.i18nService.availableLangs;
  protected readonly languageForm = form(
    signal({
      lang: this.i18nService.lang
    })
  );

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
      return user
        ? this.userService.scoreUpdates(user.id).pipe(
            startWith(user),
            catchError(() => EMPTY)
          )
        : of(undefined);
    }
  });

  constructor() {
    effect(() => {
      this.i18nService.changeLanguage(this.languageForm.lang().value());
    });
  }
}
