import { Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserService } from '../services/user-service';
import { Router } from '@angular/router';

@Component({
  selector: 'pr-login',
  imports: [ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly userService = inject(UserService);
  private readonly router = inject(Router);

  protected readonly authenticationFailed = signal(false);

  protected readonly credentials = this.fb.group({
    login: ['', Validators.required],
    password: ['', Validators.required]
  });

  protected authenticate(): void {
    this.authenticationFailed.set(false);

    if (!this.credentials.valid) {
      this.credentials.markAllAsTouched();
      return;
    }

    const { login, password } = this.credentials.getRawValue();

    this.userService.authenticate(login, password).subscribe({
      next: () => this.router.navigateByUrl('/'),
      error: () => this.authenticationFailed.set(true)
    });
  }
}
