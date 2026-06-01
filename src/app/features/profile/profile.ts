import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../core/services/auth.service';
import { API_URL } from '../../core/constants/constants';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { InputText } from 'primeng/inputtext';
import { Button } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { fadeInOut } from '../../shared/animations/animations';
import { isDefaultUser } from '../../core/utils/def_user.utils';
import { TooltipModule } from 'primeng/tooltip';
import {
  hasUppercase,
  hasNumber,
  hasSpecialCharacter,
  passwordsMatch,
} from '../../core/utils/validators';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputText, Button, TranslocoModule, TooltipModule],
  animations: [fadeInOut],
  templateUrl: './profile.html',
  styleUrl: './profile.scss',
})
export class ProfileComponent implements OnInit {
  private readonly http = inject(HttpClient);
  protected readonly authService = inject(AuthService);
  private readonly translocoService = inject(TranslocoService);

  protected readonly isDefaultUser = computed(() =>
    isDefaultUser(this.authService.currentUser()?.id),
  );

  error = signal<string | null>(null);
  success = signal(false);
  loading = signal(false);
  showPassword = signal(false);
  showNewPassword = signal(false);

  form = new FormGroup(
    {
      username: new FormControl('', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(20),
      ]),
      currentPassword: new FormControl(''),
      newPassword: new FormControl('', [
        Validators.minLength(6),
        Validators.maxLength(128),
        hasUppercase,
        hasNumber,
        hasSpecialCharacter,
      ]),
      confirmNewPassword: new FormControl(''),
    },
    { validators: passwordsMatch },
  );

  ngOnInit(): void {
    const user = this.authService.currentUser();
    if (user) this.form.patchValue({ username: user.username });
  }

  get hasChanges(): boolean {
    const user = this.authService.currentUser();
    return (
      this.form.get('username')?.value !== user?.username || !!this.form.get('newPassword')?.value
    );
  }

  get passwordMismatch(): boolean {
    return (
      !!this.form.errors?.['passwordMismatch'] && !!this.form.get('confirmNewPassword')?.touched
    );
  }

  getFieldError(field: string): string | null {
    const control = this.form.get(field);
    if (!control?.invalid || !control?.touched) return null;

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

  getSaveTooltip(): string {
    if (this.isDefaultUser())
      return this.translocoService.translate('auth.edit.profile.errors.defaultUser');
    if (!this.hasChanges)
      return this.translocoService.translate('auth.edit.profile.errors.noChanges');
    return '';
  }

  save(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    const { username, currentPassword, newPassword } = this.form.value;
    const currentUser = this.authService.currentUser();

    if (newPassword && !currentPassword) {
      this.error.set('edit.errors.currentPasswordRequired');
      return;
    }

    const body: any = {};
    if (username !== currentUser?.username) body.username = username;
    if (newPassword) {
      body.newPassword = newPassword;
      body.currentPassword = currentPassword;
    }

    if (Object.keys(body).length === 0) return;

    this.loading.set(true);
    this.error.set(null);

    this.http
      .patch<{ id: string; username: string; role: any }>(`${API_URL}/users/me`, body)
      .subscribe({
        next: (res) => {
          this.authService.currentUser.update((u) => (u ? { ...u, username: res.username } : null));
          this.success.set(true);
          this.form.patchValue({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
          this.loading.set(false);
          setTimeout(() => this.success.set(false), 3000);
        },
        error: (err) => {
          if (err.status === 409) this.error.set('auth.errors.userExists');
          else if (err.status === 401)
            this.error.set('auth.edit.profile.errors.invalidCurrentPassword');
          else this.error.set('edit.profile.errors.updateFailed');
          this.loading.set(false);
        },
      });
  }
}
