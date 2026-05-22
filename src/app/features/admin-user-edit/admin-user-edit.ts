import { Component, inject, signal, OnInit, computed, ChangeDetectionStrategy } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { InputText } from 'primeng/inputtext';
import { Button } from 'primeng/button';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { API_URL } from '../../core/constants/constants';
import { isDefaultUser } from '../../core/utils/def_user.utils';
import { TooltipModule } from 'primeng/tooltip';
import { AuthService } from '../../core/services/auth.service';
import { Role } from '../../core/models/role.enum';

@Component({
  selector: 'app-admin-user-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputText, Button, TranslocoModule, TooltipModule],
  templateUrl: './admin-user-edit.html',
  styleUrl: './admin-user-edit.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminUserEditComponent implements OnInit {
  protected readonly authService = inject(AuthService);
  private readonly http = inject(HttpClient);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly translocoService = inject(TranslocoService);

  userId = signal<string>('');
  originalUsername = signal('');
  error = signal<string | null>(null);
  success = signal(false);
  loading = signal(false);

  readonly isDefaultUserProtected = computed(() => isDefaultUser(this.userId()));

  form = new FormGroup({
    username: new FormControl('', [
      Validators.required,
      Validators.minLength(3),
      Validators.maxLength(20),
    ]),
  });

  get hasChanges(): boolean {
    return this.form.get('username')?.value !== this.originalUsername();
  }

  getFieldError(field: string): string | null {
    const control = this.form.get(field);
    if (!control?.invalid || !control?.touched) return null;
    if (control.errors?.['required']) return 'auth.errors.required';
    if (control.errors?.['minlength']) return 'auth.errors.usernameTooShort';
    if (control.errors?.['maxlength']) return 'auth.errors.usernameTooLong';
    return null;
  }

  getSaveTooltip(): string {
    if (this.isDefaultUserProtected())
      return this.translocoService.translate('auth.edit.profile.defaultUser');
    if (!this.hasChanges)
      return this.translocoService.translate('auth.edit.profile.errors.noChanges');
    return '';
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id') ?? '';
    this.userId.set(id);

    if (isDefaultUser(id)) {
      this.router.navigate(['/admin']);
      return;
    }

    const currentUser = this.authService.currentUser();

    this.http
      .get<{ id: string; username: string; role: string }>(`${API_URL}/users/${id}`)
      .subscribe({
        next: (user) => {
          if (user.role === Role.ADMIN && id !== currentUser?.id) {
            this.router.navigate(['/admin']);
            return;
          }
          this.form.patchValue({ username: user.username });
          this.originalUsername.set(user.username);
        },
        error: () => this.error.set('auth.errors.adminEditFailed'),
      });
  }

  save(): void {
    if (this.form.invalid) return;

    this.loading.set(true);
    this.error.set(null);

    this.http.patch(`${API_URL}/users/${this.userId()}`, {
      username: this.form.get('username')?.value,
    }).subscribe({
      next: () => {
        this.success.set(true);
        this.originalUsername.set(this.form.get('username')?.value ?? '');
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
}