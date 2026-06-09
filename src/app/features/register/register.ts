import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { InputText } from 'primeng/inputtext';
import { Button } from 'primeng/button';
import { TranslocoModule } from '@jsverse/transloco';
import { AuthService } from '../../core/services/auth.service';
import { fadeInOut } from '../../shared/animations/animations';
import {
  hasUppercase,
  hasNumber,
  hasSpecialCharacter,
  passwordsMatch,
  usernameAvailableValidator,
} from '../../core/utils/validators';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-register',
  standalone: true,
  animations: [fadeInOut],
  imports: [ReactiveFormsModule, InputText, Button, TranslocoModule],
  templateUrl: './register.html',
  styleUrls: ['./register.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegisterComponent {
  private readonly authService = inject(AuthService);
  protected readonly router = inject(Router);
  private readonly http = inject(HttpClient);

  error = signal<string | null>(null);
  success = signal(false);
  loading = signal(false);
  showPassword = signal(false);

  // Reactive registration form with synchronous and async validation.
  form = new FormGroup(
    {
      username: new FormControl(
        '',
        // sync validators
        [Validators.required, Validators.minLength(3), Validators.maxLength(20)],
        // async validator
        [usernameAvailableValidator(this.http)],
      ),
      password: new FormControl('', [
        Validators.required,
        Validators.minLength(6),
        Validators.maxLength(128),
        hasUppercase,
        hasNumber,
        hasSpecialCharacter,
      ]),
      confirmPassword: new FormControl('', [Validators.required]),
    },
    { validators: passwordsMatch },
  );

  // Submit registration data and show success/error state.
  register(): void {
    if (this.form.invalid) return;

    this.loading.set(true);
    this.error.set(null);

    const { username, password } = this.form.value;

    this.authService.register(username!, password!).subscribe({
      next: () => {
        this.success.set(true);
        setTimeout(() => this.router.navigate(['/login']), 1500);
      },
      error: (err) => {
        if (err.status === 409) this.error.set('auth.errors.userExists');
        // else this.error.set('auth.errors.required');
        else this.error.set('auth.registererrors.registrationFailed'); // maybe this better - will see

        this.loading.set(false);
      },
      complete: () => this.loading.set(false),
    });
  }

  // Helper used by the template to surface validation messages.
  getFieldError(field: string): string | null {
    const control = this.form.get(field);
    if (!control?.invalid || !control?.touched || control?.pending) return null;

    if (control.errors?.['required']) return 'auth.errors.required';
    if (control.errors?.['minlength']) {
      return field === 'username' ? 'auth.errors.usernameTooShort' : 'auth.errors.passwordTooShort';
    }
    if (control.errors?.['maxlength']) {
      return field === 'username' ? 'auth.errors.usernameTooLong' : 'auth.errors.passwordTooLong';
    }
    if (control.errors?.['noUppercase']) return 'auth.errors.passwordNeedsUppercase';
    if (control.errors?.['noNumber']) return 'auth.errors.passwordNeedsNumber';
    if (control.errors?.['noSpecialChar']) return 'auth.errors.passwordNeedsSpecChar';
    if (control.errors?.['usernameTaken']) return 'auth.errors.userExists';

    return null;
  }

  get passwordMismatch(): boolean {
    return !!this.form.errors?.['passwordMismatch'] && !!this.form.get('confirmPassword')?.touched;
  }
}
