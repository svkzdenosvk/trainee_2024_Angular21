import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const adminGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  // Only allow access to admin routes for authenticated administrators.
  if (auth.isLoggedIn() && auth.isAdmin()) return true;

  router.navigate(['/']);
  return false;
};
