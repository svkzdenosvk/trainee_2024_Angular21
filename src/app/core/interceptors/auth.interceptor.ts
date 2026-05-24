

import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

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
      return throwError(() => error);
    }),
  );
};
