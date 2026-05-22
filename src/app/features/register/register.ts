import { Component, inject, signal,ChangeDetectionStrategy } from '@angular/core';
import {
  ReactiveFormsModule,
  FormGroup,
  FormControl,
  Validators,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { Router } from '@angular/router';
import { InputText } from 'primeng/inputtext';
import { Button } from 'primeng/button';
import { TranslocoModule } from '@jsverse/transloco';
import { AuthService } from '../../core/services/auth.service';
import { hasUppercase, hasNumber, hasSpecialCharacter, passwordsMatch } from '../../core/utils/validators';

// // own validators for password complexity and matching
// function hasUppercase(control: AbstractControl): ValidationErrors | null {
//   return /[A-Z]/.test(control.value) ? null : { noUppercase: true };
// }

// function hasNumber(control: AbstractControl): ValidationErrors | null {
//   return /[0-9]/.test(control.value) ? null : { noNumber: true };
// }

// function hasSpecialCharacter(control: AbstractControl): ValidationErrors | null {
//   return /[!@#$%^&*\-]/.test(control.value) ? null : { noSpecialChar: true };
// }

// function passwordsMatch(group: AbstractControl): ValidationErrors | null {
//   const password = group.get('password')?.value;
//   const confirm = group.get('confirmPassword')?.value;
//   return password === confirm ? null : { passwordMismatch: true };
// }

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, InputText, Button, TranslocoModule],
  templateUrl: './register.html',
  styleUrls: ['./register.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegisterComponent {
  private readonly authService = inject(AuthService);
  protected readonly router = inject(Router);

  error = signal<string | null>(null);
  success = signal(false);
  loading = signal(false);
  showPassword = signal(false);

  form = new FormGroup(
    {
      username: new FormControl('', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(20),
      ]),
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
        else this.error.set('auth.errors.required');
        this.loading.set(false);
      },
      complete: () => this.loading.set(false),
    });
  }

  // helper for template
  getFieldError(field: string): string | null {
    const control = this.form.get(field);
    if (!control?.invalid || !control?.touched) return null;

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
    return null;
  }

  get passwordMismatch(): boolean {
    return !!this.form.errors?.['passwordMismatch'] && !!this.form.get('confirmPassword')?.touched;
  }
}
