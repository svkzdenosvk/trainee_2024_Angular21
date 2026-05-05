import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { InputText } from 'primeng/inputtext';
import { Button } from 'primeng/button';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { API_URL } from '../../core/constants/constants';
import { validateUsername } from '../../core/utils/validators';
import { isDefaultUser } from '../../core/utils/def_user.utils';
import { TooltipModule } from 'primeng/tooltip';
import { AuthService } from '../../core/services/auth.service';
import { Role } from '../../core/models/role.enum';

@Component({
  selector: 'app-admin-user-edit',
  standalone: true,
  imports: [CommonModule, FormsModule, InputText, Button, TranslocoModule, TooltipModule],
  templateUrl: './admin-user-edit.html',
  styleUrl: './admin-user-edit.scss',
})
export class AdminUserEditComponent implements OnInit {
  protected readonly authService = inject(AuthService);

  private readonly http = inject(HttpClient);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly translocoService = inject(TranslocoService);

  userId = signal<string>('');
  username = signal('');
  originalUsername = signal('');
  error = signal<string | null>(null);
  success = signal(false);
  loading = signal(false);

  readonly isDefaultUserProtected = computed(() => isDefaultUser(this.userId()));

  get hasChanges(): boolean {
    return this.username() !== this.originalUsername();
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id') ?? '';
    this.userId.set(id);

    // cannot edit default user
    const currentUser = this.authService.currentUser();
    if (isDefaultUser(id)) {
      this.router.navigate(['/admin']);
      return;
    }

    this.http
      .get<{ id: string; username: string; role: string }>(`${API_URL}/users/${id}`)
      .subscribe({
        next: (user) => {
          //not edit other admin
          if (user.role === Role.ADMIN && id !== currentUser?.id) {
            this.router.navigate(['/admin']);
            return;
          }

          this.username.set(user.username);
          this.originalUsername.set(user.username);
        },
        error: () => this.error.set('auth.errors.adminEditFailed'),
      });
  }

  save(): void {
    const usernameError = validateUsername(this.username());
    if (usernameError) {
      this.error.set(usernameError);
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    this.http
      .patch(`${API_URL}/users/${this.userId()}`, {
        username: this.username(),
      })
      .subscribe({
        next: () => {
          this.success.set(true);
          this.originalUsername.set(this.username());
          this.loading.set(false);
          setTimeout(() => this.router.navigate(['/admin']), 1500);
        },
        error: (err) => {
          if (err.status === 409) this.error.set('auth.errors.userExists');
          else this.error.set('auth.errors.adminEditFailed');
          this.loading.set(false);
        },
      });
  }

  cancel(): void {
    this.router.navigate(['/admin']);
  }

  // UI
  getSaveTooltip(): string {
    if (this.isDefaultUserProtected())
      return this.translocoService.translate('auth.edit.profile.defaultUser');
    if (!this.hasChanges)
      return this.translocoService.translate('auth.edit.profile.errors.noChanges');
    return '';
  }
}
