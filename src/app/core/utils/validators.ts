//validators for reactive forms frontend and backend
import { AbstractControl, AsyncValidatorFn, ValidationErrors } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Observable, map, catchError, of, debounceTime, switchMap, first } from 'rxjs';
import { API_URL } from '../constants/constants';

//FE validators
// Angular FormControl validators
export function hasUppercase(control: AbstractControl): ValidationErrors | null {
  if (!control.value) return null;
  return /[A-Z]/.test(control.value) ? null : { noUppercase: true };
}

export function hasNumber(control: AbstractControl): ValidationErrors | null {
  if (!control.value) return null;
  return /[0-9]/.test(control.value) ? null : { noNumber: true };
}

export function hasSpecialCharacter(control: AbstractControl): ValidationErrors | null {
  if (!control.value) return null;
  return /[!@#$%^&*+\-_=?]/.test(control.value) ? null : { noSpecialChar: true };
}

export function passwordsMatch(group: AbstractControl): ValidationErrors | null {
  const password = group.get('password')?.value ?? group.get('newPassword')?.value;
  const confirm = group.get('confirmPassword')?.value ?? group.get('confirmNewPassword')?.value;
  if (!password && !confirm) return null;
  return password === confirm ? null : { passwordMismatch: true };
}

// Pure functions for validation (for non-form use)
export function validatePassword(password: string): string | null {
  if (password.length < 6) return 'auth.errors.passwordTooShort';
  if (password.length > 128) return 'auth.errors.passwordTooLong';
  if (!/[A-Z]/.test(password)) return 'auth.errors.passwordNeedsUppercase';
  if (!/[0-9]/.test(password)) return 'auth.errors.passwordNeedsNumber';
  if (!/[!@#$%^&*+\-_=?]/.test(password)) return 'auth.errors.passwordNeedsSpecChar';
  return null;
}

export function validateUsername(username: string): string | null {
  if (username.trim().length < 3) return 'auth.errors.usernameTooShort';
  if (username.trim().length > 20) return 'auth.errors.usernameTooLong';
  return null;
}

//BE validators
export function usernameAvailableValidator(
  http: HttpClient,
  username?: string,
): AsyncValidatorFn {
  return (control: AbstractControl): Observable<ValidationErrors | null> => {
    if (!control.value || control.value.length < 3) {
      return of(null);
    }
    if (control.value === username) return of(null); // own name or when admin edits another user but doesn't change the username, skip the check

    return of(control.value).pipe(
      debounceTime(500),
      switchMap((username) =>
        http.get<{ available: boolean }>(`${API_URL}/auth/check-username/${username}`).pipe(
          map((res) => (res.available ? null : { usernameTaken: true })),
          catchError(() => of(null)),
        ),
      ),
      first(),
    );
  };
}
