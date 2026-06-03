import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { catchError, throwError } from 'rxjs';
import { ErrorService } from '../services/error.service';


export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const errorService = inject(ErrorService);

  // jump over the open-meteo requests
  if (req.url.includes('open-meteo.com') || req.url.includes('nominatim.openstreetmap.org')) {
    return next(req);
  }

  //  withCredentials for cookies
  const cloned = req.clone({ withCredentials: true });

  return next(cloned).pipe(
    catchError((error: HttpErrorResponse) => {
      const isPasswordChange = req.url.includes('/users/me') && req.method === 'PATCH';
      if (error.status === 401 && !isPasswordChange) {
        authService.logout();
      }

      if (error.status === 500) {
        errorService.showError('errors.serverError');
        router.navigate(['/error']);
      }
      if (error.status === 0) {
        // network error - server not available
        errorService.showError('errors.networkError');
        // router.navigate(['/error']);   <-- maybe we want to stay on the same page and just show a message?
      }

      return throwError(() => error);
    }),
  );
};
