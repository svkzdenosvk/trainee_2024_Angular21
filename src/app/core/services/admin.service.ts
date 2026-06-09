import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { UserWithStats } from '../models/user.model';
import { Role } from '../models/role.enum';
import { API_URL } from '../constants/constants';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private readonly http = inject(HttpClient);

  users = signal<UserWithStats[]>([]);
  loading = signal(true);

  // Load user list for the admin dashboard.
  loadUsers(): void {
    this.loading.set(true);
    this.http.get<UserWithStats[]>(`${API_URL}/admin/users`).subscribe({
      next: (data) => {
        this.users.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  // Delete a user by admin action.
  deleteUser(id: string) {
    return this.http.delete(`${API_URL}/admin/users/${id}`);
  }

  // Change the role of a user from the admin panel.
  updateRole(id: string, role: Role) {
    return this.http.patch(`${API_URL}/admin/users/${id}/role`, { role });
  }
}
