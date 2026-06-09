import {
  Component,
  inject,
  signal,
  OnInit,
  computed,
  ChangeDetectionStrategy,
} from '@angular/core';
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
import { fadeInOut } from '../../shared/animations/animations';
import { usernameAvailableValidator } from '../../core/utils/validators';

@Component({
  selector: 'app-admin-user-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputText, Button, TranslocoModule, TooltipModule],
  animations: [fadeInOut],
  templateUrl: './admin-user-edit.html',
  styleUrl: './admin-user-edit.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
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

  // Form for editing a user's username in the admin section.
  form = new FormGroup({
    username: new FormControl(
      '',
      [Validators.required, Validators.minLength(3), Validators.maxLength(20)],
      // [usernameAvailableValidator(this.http, this.originalUsername())],
    ),
  });

  get hasChanges(): boolean {
    return this.form.get('username')?.value !== this.originalUsername();
  }

  getFieldError(field: string): string | null {
    const control = this.form.get(field);
    if (!control?.invalid || !control?.touched || control?.pending) return null;
    if (control.errors?.['required']) return 'auth.errors.required';
    if (control.errors?.['minlength']) return 'auth.errors.usernameTooShort';
    if (control.errors?.['maxlength']) return 'auth.errors.usernameTooLong';
    if (control.errors?.['usernameTaken']) return 'auth.errors.userExists';

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

          // adding async validator
          this.form
            .get('username')
            ?.setAsyncValidators([usernameAvailableValidator(this.http, this.originalUsername())]);

          // trigger re-validation (this will also run the async check)
          this.form.get('username')?.updateValueAndValidity();
        },
        error: () => this.error.set('auth.adminDashboard.errors.adminEditFailed'),
      });
  }

  private _createForm(): void {
    this.form = new FormGroup({
      username: new FormControl(
        '',
        [Validators.required, Validators.minLength(3), Validators.maxLength(20)],
        [usernameAvailableValidator(this.http, this.originalUsername())], // ✅ UŽ JE SPRÁVNE
      ),
    });
  }

  // Apply username change for the selected admin user.
  save(): void {
    if (this.form.invalid) return;

    this.loading.set(true);
    this.error.set(null);

    this.http
      .patch(`${API_URL}/users/${this.userId()}`, {
        username: this.form.get('username')?.value,
      })
      .subscribe({
        next: () => {
          this.success.set(true);
          this.originalUsername.set(this.form.get('username')?.value ?? '');
          this.loading.set(false);
          setTimeout(() => this.router.navigate(['/admin']), 1500);
        },
        error: (err) => {
          if (err.status === 409) this.error.set('auth.errors.userExists');
          else this.error.set('auth.adminDashboard.errors.adminEditFailed');
          this.loading.set(false);
        },
      });
  }

  cancel(): void {
    this.router.navigate(['/admin']);
  }
}
