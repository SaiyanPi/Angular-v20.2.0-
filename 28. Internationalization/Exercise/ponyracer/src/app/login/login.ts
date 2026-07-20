import { Component, inject, signal } from '@angular/core';
import { UserService } from '../services/user-service';
import { Router } from '@angular/router';
import { form, required, FormField, FormRoot } from '@angular/forms/signals';
import { firstValueFrom } from 'rxjs';
import { FormLabel } from '../directives/form-label';
import { NgbAlert } from '@ng-bootstrap/ng-bootstrap';
import { TranslocoDirective } from '@jsverse/transloco';


@Component({
  selector: 'pr-login',
  imports: [FormField, FormRoot, NgbAlert, FormLabel, TranslocoDirective],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  private readonly userService = inject(UserService);
  private readonly router = inject(Router);

  protected readonly authenticationFailed = signal(false);

  protected readonly fields = signal({
    login: '',
    password: ''
  });

  protected readonly credentials = form(
    this.fields,
    f => {
      required(f.login);
      required(f.password);
    },
    {
      submission: {
        action: async () => await this.authenticate()
        // onInvalid: () => this.authenticationFailed.set(true)
      }
    }
  );

  private async authenticate() {
    this.authenticationFailed.set(false);
    const { login, password } = this.credentials().value();
    try {
      await firstValueFrom(this.userService.authenticate(login, password));
      await this.router.navigateByUrl('/');
      return;
    } catch {
      this.authenticationFailed.set(true);
    }
  }
}
