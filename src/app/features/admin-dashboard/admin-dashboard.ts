import { Component, inject, signal, OnInit } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { AdminService } from '../../core/services/admin.service';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { CommonModule } from '@angular/common';
import { UserWithStats } from '../../core/models/user.model';
import { TooltipModule } from 'primeng/tooltip';
import { Role } from '../../core/models/role.enum';
import { DEFAULT_USER_IDS } from '../../core/constants/constants';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, TableModule, TagModule, ButtonModule, TranslocoModule, TooltipModule],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.scss',
})
export class AdminDashboardComponent {
  protected readonly authService = inject(AuthService);
  protected readonly adminService = inject(AdminService);
  protected readonly Role = Role;

  private readonly translocoService = inject(TranslocoService);

  errorMessage = signal<string | null>(null);

  ngOnInit(): void {
    this.adminService.loadUsers();
  }

  private _showError(msg: string): void {
    this.errorMessage.set(msg);
    setTimeout(() => this.errorMessage.set(null), 3500);
  }

  _canDelete(user: UserWithStats): boolean {
    if (this.authService.currentUser()?.id === user.id) return false;
    if (DEFAULT_USER_IDS.includes(user.id)) return false;
    return true;
  }

  deleteUser(user: UserWithStats): void {
    if (!this._canDelete(user)) return;

    this.adminService.deleteUser(user.id).subscribe({
      next: () => this.adminService.loadUsers(),
      error: () =>
        this._showError(this.translocoService.translate('auth.adminDashboard.errors.deleteFailed')),
    });
  }

  _canChangeRole(user: UserWithStats): boolean {
    if (this.authService.currentUser()?.id === user.id) return false;
    if (DEFAULT_USER_IDS.includes(user.id)) return false;
    return true;
  }

  changeRole(user: UserWithStats): void {
    if (!this._canChangeRole(user)) return;

    const newRole = user.role === Role.ADMIN ? Role.USER : Role.ADMIN;
    this.adminService.updateRole(user.id, newRole).subscribe({
      next: () => this.adminService.loadUsers(),
      error: () =>
        this._showError(this.translocoService.translate('auth.adminDashboard.errors.roleFailed')),
    });
  }

  isDefaultUser(user: UserWithStats): boolean {
    return DEFAULT_USER_IDS.includes(user.id);
  }

  getSeverity(role: string): 'success' | 'warn' {
    return role === Role.ADMIN ? 'warn' : 'success';
  }

  // UI
  //-----
  getDeleteTooltip(user: UserWithStats): string {
    if (this.authService.currentUser()?.id === user.id)
      return this.translocoService.translate('auth.adminDashboard.errors.errorDelSelf');
    if (DEFAULT_USER_IDS.includes(user.id))
      return this.translocoService.translate('auth.adminDashboard.errors.errorDelDefault');
    return this.translocoService.translate('auth.adminDashboard.deleteBtn');
  }

  getRoleTooltip(user: UserWithStats): string {
    if (this.authService.currentUser()?.id === user.id)
      return this.translocoService.translate('auth.adminDashboard.errors.errorSelfRole');
    if (DEFAULT_USER_IDS.includes(user.id))
      return this.translocoService.translate('auth.adminDashboard.errors.errorDefRole');
    return user.role === Role.ADMIN
      ? this.translocoService.translate('auth.adminDashboard.roleDowngrade')
      : this.translocoService.translate('auth.adminDashboard.roleUpgrade');
  }
}
