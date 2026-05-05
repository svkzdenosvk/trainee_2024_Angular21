import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { InputText } from 'primeng/inputtext';
import { Button } from 'primeng/button';
import { TranslocoModule } from '@jsverse/transloco';
import { AuthService } from '../../core/services/auth.service';
import { validatePassword, validateUsername } from '../../core/utils/validators';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, InputText, Button, TranslocoModule],
  templateUrl: './register.html',
  styleUrls: ['./register.scss'],
})
export class RegisterComponent {
  private readonly authService = inject(AuthService);
  protected readonly router = inject(Router);

  username = signal('');
  password = signal('');
  confirmPassword = signal('');
  error = signal<string | null>(null);
  success = signal(false);
  loading = signal(false);
  showPassword = signal(false);

  register(): void {
    if (!this.username().trim() || !this.password().trim()) {
      this.error.set('auth.required');
      return;
    }

    //username validator
    const usernameError = validateUsername(this.username());
    if (usernameError) {
      this.error.set(usernameError);
      return;
    }

    // password valdiator
    const passwordError = validatePassword(this.password());
    if (passwordError) {
      this.error.set(passwordError);
      return;
    }
    if (this.password() !== this.confirmPassword()) {
      this.error.set('auth.errors.passwordMismatch');
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    this.authService.register(this.username(), this.password()).subscribe({
      next: () => {
        this.success.set(true);
        setTimeout(() => this.router.navigate(['/login']), 1500);
      },
      error: (err) => {
        if (err.status === 409) {
          this.error.set('auth.errors.userExists');
        } else {
          this.error.set('auth.errors.required');
        }
        this.loading.set(false);
      },
      complete: () => this.loading.set(false),
    });
  }
}
