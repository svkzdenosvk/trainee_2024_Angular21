import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { UserWithStats } from '../models/user.model';

const API_URL = 'http://localhost:3000';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private readonly http = inject(HttpClient);

  users = signal<UserWithStats[]>([]);

  loadUsers(): void {
    this.http.get<UserWithStats[]>(`${API_URL}/admin/users`).subscribe(data => {
      this.users.set(data);
    });
  }

  deleteUser(id: string) {
    return this.http.delete(`${API_URL}/admin/users/${id}`);
  }

  updateRole(id: string, role: 'admin' | 'user') {
    return this.http.patch(`${API_URL}/admin/users/${id}/role`, { role });
  }
}