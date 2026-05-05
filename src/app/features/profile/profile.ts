import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { API_URL } from '../../core/constants/constants';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { InputText } from 'primeng/inputtext';
import { Button } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { validatePassword, validateUsername } from '../../core/utils/validators';
import { isDefaultUser } from '../../core/utils/def_user.utils';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, InputText, Button, TranslocoModule, TooltipModule],
  templateUrl: './profile.html',
  styleUrl: './profile.scss',
})
export class ProfileComponent implements OnInit {
  private readonly http = inject(HttpClient);
  protected readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly translocoService = inject(TranslocoService);
  protected readonly isDefaultUser = computed(() =>
    isDefaultUser(this.authService.currentUser()?.id),
  );

  username = signal('');
  currentPassword = signal('');
  newPassword = signal('');
  confirmNewPassword = signal('');
  error = signal<string | null>(null);
  success = signal(false);
  loading = signal(false);
  showPassword = signal(false);
  showNewPassword = signal(false);

  ngOnInit(): void {
    const user = this.authService.currentUser();
    if (user) this.username.set(user.username);
  }

  // if something has been changed
  get hasChanges(): boolean {
    const user = this.authService.currentUser();
    return this.username() !== user?.username || !!this.newPassword();
  }

  save(): void {
    this.error.set(null);

    //password validation
    if (this.newPassword()) {
      if (this.newPassword() !== this.confirmNewPassword()) {
        this.error.set('auth.errors.passwordMismatch');
        return;
      }

      const passwordError = validatePassword(this.newPassword());
      if (passwordError) {
        this.error.set(passwordError);
        return;
      }

      if (!this.currentPassword()) {
        this.error.set('edit.profile.errors.currentPasswordRequired');
        return;
      }
    }
    //username validation
    const usernameError = validateUsername(this.username());
    if (usernameError) {
      this.error.set(usernameError);
      return;
    }

    const body: any = {};
    const currentUser = this.authService.currentUser();
    if (this.username() !== currentUser?.username) body.username = this.username();
    if (this.newPassword()) {
      body.newPassword = this.newPassword();
      body.currentPassword = this.currentPassword();
    }

    if (Object.keys(body).length === 0) return;

    this.loading.set(true);

    this.http
      .patch<{ id: string; username: string; role: any }>(`${API_URL}/users/me`, body)
      .subscribe({
        next: (res) => {
          this.authService.currentUser.update((u) => (u ? { ...u, username: res.username } : null));
          this.success.set(true);
          this.currentPassword.set('');
          this.newPassword.set('');
          this.confirmNewPassword.set('');
          this.loading.set(false);
          setTimeout(() => this.success.set(false), 3000);
        },
        error: (err) => {
          if (err.status === 409) this.error.set('auth.errors.userExists');
          else if (err.status === 401) this.error.set('auth.edit.profile.errors.invalidCurrentPassword');
          else this.error.set('edit.profile.errors.updateFailed');
          this.loading.set(false);
        },
      });
  }

  //UI
  getSaveTooltip(): string {
    if (this.isDefaultUser())
      return this.translocoService.translate('auth.edit.profile.errors.defaultUser');
    if (!this.hasChanges)
      return this.translocoService.translate('auth.edit.profile.errors.noChanges');
    return '';
  }
}
