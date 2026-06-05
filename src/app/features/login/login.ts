import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { InputText } from 'primeng/inputtext';
import { Button } from 'primeng/button';
import { TranslocoModule } from '@jsverse/transloco';
import { AuthService } from '../../core/services/auth.service';
import { fadeInOut } from '../../shared/animations/animations';

@Component({
  selector: 'app-login',
  standalone: true,
  animations: [fadeInOut],
  imports: [ReactiveFormsModule, InputText, Button, TranslocoModule],
  templateUrl: './login.html',
  styleUrls: ['./login.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  // signals stay only for UI state
  error = signal<string | null>(null);
  loading = signal(false);
  showPassword = signal(false);

  // FormGroup replaces username/password signals
  form = new FormGroup({
    username: new FormControl('', [Validators.required]),
    password: new FormControl('', [Validators.required]),
  });

  login(): void {
    if (this.form.invalid) {
      this.error.set('auth.errors.required');
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    const { username, password } = this.form.value;

    this.authService.login(username!, password!).subscribe({
      next: () => {
        this.router.navigate(['/']);
      },
      error: () => {
        this.error.set('auth.errors.invalid');
        this.loading.set(false);
      },
      complete: () => this.loading.set(false),
    });
  }
}