import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { UserService } from '../services/user-service';
import { Router } from '@angular/router';
import { form, FormField, FormRoot, minLength, required, validate, max, min } from '@angular/forms/signals';
import { firstValueFrom } from 'rxjs';
import { BirthYearInput } from '../birth-year-input/birth-year-input';

@Component({
  selector: 'pr-register',
  imports: [FormField, FormRoot, BirthYearInput],
  templateUrl: './register.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './register.css'
})
export class Register {
  private readonly userService = inject(UserService);
  private readonly router = inject(Router);
  protected readonly registrationFailed = signal(false);

  protected readonly fields = signal({
    login: '',
    password: '',
    confirmPassword: '',
    birthYear: null as number | null
  });

  protected readonly userForm = form(
    this.fields,
    f => {
      required(f.login);
      minLength(f.login, 3);
      required(f.password);
      required(f.confirmPassword);
      validate(f.confirmPassword, context => {
        const password = context.valueOf(f.password);
        const confirmPassword = context.value();
        return password === confirmPassword ? undefined : { kind: 'matchingError' };
      });
      required(f.birthYear);
      min(f.birthYear, 1900);
      max(f.birthYear, new Date().getFullYear());
    },
    {
      submission: {
        action: async () => await this.register()
      }
    }
  );

  private async register() {
    this.registrationFailed.set(false);
    const { login, password, birthYear } = this.userForm().value();
    try {
      await firstValueFrom(this.userService.register(login, password, birthYear!));
      await this.router.navigateByUrl('/');
      return;
    } catch {
      this.registrationFailed.set(true);
    }
  }
}
