import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs';

import { User } from '../models/user.model';
import { API_URL } from '../constants/constants';
import { Role } from '../models/role.enum';

const AUTH_KEY = 'auth_user';
const TOKEN_KEY = 'auth_token';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly router = inject(Router);
  private readonly http = inject(HttpClient);

  currentUser = signal<User | null>(JSON.parse(localStorage.getItem(AUTH_KEY) ?? 'null'));

  readonly isLoggedIn = computed(() => this.currentUser() !== null);
  readonly isAdmin = computed(() => this.currentUser()?.role === Role.ADMIN);

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  login(username: string, password: string) {
    return this.http
      .post<{ access_token: string; user: User }>(`${API_URL}/auth/login`, { username, password })
      .pipe(
        tap((res) => {
          this.currentUser.set(res.user);
          localStorage.setItem(AUTH_KEY, JSON.stringify(res.user));
          localStorage.setItem(TOKEN_KEY, res.access_token);
        }),
      );
  }

  register(username: string, password: string) {
    return this.http.post<{ message: string; userId: string }>(`${API_URL}/auth/register`, {
      username,
      password,
    });
  }

  logout(): void {
    this.currentUser.set(null);
    localStorage.removeItem(AUTH_KEY);
    localStorage.removeItem(TOKEN_KEY);
    this.router.navigate(['/login']);
  }
}
