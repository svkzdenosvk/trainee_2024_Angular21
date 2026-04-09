import { Component, inject, computed, signal } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { TranslocoModule } from '@jsverse/transloco';
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
  errorMessage = signal<string | null>(null);

  users = this.authService.allUsersWithStats;

  ngOnInit(): void {
    //refresh stats - mainly favourites count, in case admin or users add/deleted some locations
    this.authService.refreshStats();
  }

private _showError(msg: string): void {
  this.errorMessage.set(msg);
  setTimeout(() => this.errorMessage.set(null), 3500);
}

  deleteUser(user: UserWithStats): void {
    if (!this.authService.canDelete(user)) {
      // this.errorMessage.set('Default users cannot be deleted.'); //will be translated with transloco!!!
this._showError('Default users cannot be deleted.')
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
      // this.errorMessage.set('Cannot change role of default users or yourself.');//will be translated with transloco!!!
      this._showError('Cannot change role of default users or yourself.')
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
