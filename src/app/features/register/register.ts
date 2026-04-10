import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { InputText } from 'primeng/inputtext';
import { Button } from 'primeng/button';
import { TranslocoModule } from '@jsverse/transloco';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, InputText, Button, TranslocoModule],
  templateUrl: './register.html',
   styleUrls: ['./register.scss']

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
      this.error.set('auth.errors.required');
      return;
    }

    if (this.password() !== this.confirmPassword()) {
      this.error.set('auth.register.errors.passwordMismatch');
      return;
    }

    if (this.password().length < 6) {
      this.error.set('auth.register.errors.passwordTooShort');
      return;
    }

     if (!/[A-Z]/.test(this.password())) {
      this.error.set('auth.register.errors.passwordNeedsUppercase');
      return;
    }

    if (!/[0-9]/.test(this.password())) {
      this.error.set('auth.register.errors.passwordNeedsNumber');
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    setTimeout(() => {
      const success = this.authService.register(
        this.username(),
        this.password()
      );

      if (success) {
        this.success.set(true);
        setTimeout(() => this.router.navigate(['/login']), 1500);
      } else {
        this.error.set('auth.errors.userExists');
      }
      this.loading.set(false);
    }, 500);
  }
}