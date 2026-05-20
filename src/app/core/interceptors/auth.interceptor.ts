// import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
// import { inject } from '@angular/core';
// import { AuthService } from '../services/auth.service';
// import { catchError, throwError } from 'rxjs';

// export const authInterceptor: HttpInterceptorFn = (req, next) => {
//   const authService = inject(AuthService);
//   const token = authService.getToken();

//   if (token && !req.url.includes('open-meteo.com')) {
//     const cloned = req.clone({
//       headers: req.headers.set('Authorization', `Bearer ${token}`),
//     });
//     return next(cloned).pipe(
//       //when token is expired but user is still in localstorage - res 401 -> so force to logout
//       catchError((error: HttpErrorResponse) => {
//         //the first solution
//         // // if (error.status === 401) {
//         //the second solution
//         // if (error.status === 401 && !req.url.includes('/auth/') && !req.url.includes('/users/me')) {
//         //   authService.logout();
//         // }
//         const isPasswordChange = req.url.includes('/users/me') && req.method === 'PATCH';
//         if (error.status === 401 && !isPasswordChange) {
//           authService.logout();
//         }
//         return throwError(() => error);
//       }),
//     );
//   }

//   return next(req);
// };



//CHANGE SLOVAK COMMENTS TO ENGLISH !!!!!!!!!!!!!!!

import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  // preskočí open-meteo requesty
  if (req.url.includes('open-meteo.com')) {
    return next(req);
  }

  // pridaj withCredentials pre cookies
  const cloned = req.clone({ withCredentials: true });

  return next(cloned).pipe(
    catchError((error: HttpErrorResponse) => {
      const isPasswordChange = req.url.includes('/users/me') && req.method === 'PATCH';
      if (error.status === 401 && !isPasswordChange) {
        authService.logout();
      }
      return throwError(() => error);
    })
  );
};