import { Component, inject, signal } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { CommonModule } from '@angular/common';
import { UserWithStats } from '../../core/models/user.model';
import { TooltipModule } from 'primeng/tooltip';

const DEFAULT_USER_IDS = ['1', '2'];

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, TableModule, TagModule, ButtonModule, TranslocoModule, TooltipModule],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.scss',
})
export class AdminDashboardComponent {
  protected readonly authService = inject(AuthService);
  private readonly translocoService = inject(TranslocoService);

  errorMessage = signal<string | null>(null);

  users = this.authService.allUsersWithStats;

  ngOnInit(): void {
    //refresh stats - mainly favourites count, in case admin or users add/deleted some locations
    this.authService.refreshStats();
  }

  getTooltip(role: string): string {
    return role === 'admin'
      ? this.translocoService.translate('auth.adminDashboard.roleDowngrade')
      : this.translocoService.translate('auth.adminDashboard.roleUpgrade');
  }

  private _showError(msg: string): void {
    this.errorMessage.set(msg);
    setTimeout(() => this.errorMessage.set(null), 3500);
  }

  deleteUser(user: UserWithStats): void {
    if (!this.authService.canDelete(user)) {
      this._showError(this.translocoService.translate('auth.adminDashboard.errors.errorDelete'));
      return;
    }
    this.errorMessage.set(null);

    // if selfdelete -> then logout, otherwise just delete
    if (this.authService.currentUser()?.id === user.id) {
      this.authService.deleteUser(user.id);
      this.authService.logout();
      return;
    }
    this.authService.deleteUser(user.id);
  }

  changeRole(user: UserWithStats): void {
    if (!this.authService.canChangeRole(user)) {
      this._showError(this.translocoService.translate('auth.adminDashboard.errors.errorRole'));
      return;
    }
    this.errorMessage.set(null);

    const newRole = user.role === 'admin' ? 'user' : 'admin';
    this.authService.updateRole(user.id, newRole);
  }

  isDefaultUser(user: UserWithStats): boolean {
    return DEFAULT_USER_IDS.includes(user.id);
  }

  getSeverity(role: string): 'success' | 'warn' {
    return role === 'admin' ? 'warn' : 'success';
  }
}
