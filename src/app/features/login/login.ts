import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { InputText } from 'primeng/inputtext';
import { Button } from 'primeng/button';
import { TranslocoModule } from '@jsverse/transloco';
import { AuthService } from '../../core/services/auth.service';
import { FavouritesService } from '../../core/services/favourites.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, InputText, Button, TranslocoModule],
  templateUrl: './login.html',
  styleUrls: ['./login.scss'],
})
export class LoginComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly favouritesService = inject(FavouritesService);

  username = signal('');
  password = signal('');
  error = signal<string | null>(null);
  loading = signal(false);

  login(): void {
    if (!this.username().trim() || !this.password().trim()) {
      this.error.set('auth.errors.required');
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    // Simulate async login
    setTimeout(() => {
      const success = this.authService.login(this.username(), this.password());

      if (success) {
        this.favouritesService.reloadForUser();
        this.router.navigate(['/']);
      } else {
        this.error.set('auth.errors.invalid');
      }
      this.loading.set(false);
    }, 500);
  }
}
