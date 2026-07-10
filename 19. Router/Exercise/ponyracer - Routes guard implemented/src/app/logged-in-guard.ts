import { CanActivateFn, Router } from '@angular/router';
import { UserService } from './services/user-service';
import { inject } from '@angular/core';

export const loggedInGuard: CanActivateFn = () => {
  const router = inject(Router);
  const userService = inject(UserService);

  return userService.currentUser() !== undefined || router.parseUrl('/');
};
