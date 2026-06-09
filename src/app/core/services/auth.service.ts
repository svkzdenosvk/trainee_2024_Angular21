import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs';
import { User } from '../models/user.model';
import { API_URL } from '../constants/constants';
import { Role } from '../models/role.enum';
import { Store } from '@ngrx/store';
import { AuthActions } from '../../store/auth/auth.actions';
const AUTH_KEY = 'auth_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly router = inject(Router);
  private readonly store = inject(Store);
  private readonly http = inject(HttpClient);

  // Persist the currently authenticated user in localStorage.
  currentUser = signal<User | null>(JSON.parse(localStorage.getItem(AUTH_KEY) ?? 'null'));

  readonly isLoggedIn = computed(() => this.currentUser() !== null);
  readonly isAdmin = computed(() => this.currentUser()?.role === Role.ADMIN);

  // triggered on app init to check if user is still logged in (token is valid) and update currentUser signal accordingly
  // Verify current auth session on app startup or page refresh.
  // This keeps the signal and localStorage in sync with server state.
  checkAuth() {
    return this.http
      .get<{ isLoggedIn: boolean; user?: User }>(`${API_URL}/auth/me`, { withCredentials: true })
      .pipe(
        tap((res) => {
          if (res.isLoggedIn && res.user) {
            this.currentUser.set(res.user);
            localStorage.setItem(AUTH_KEY, JSON.stringify(res.user));
            this.store.dispatch(AuthActions.loginSuccess()); // cover also page refresh
          } else {
            this.currentUser.set(null);
            localStorage.removeItem(AUTH_KEY);
          }
        }),
      );
  }

  // Authenticate user credentials and persist authenticated user state.
  login(username: string, password: string) {
    return this.http
      .post<{
        user: User;
      }>(`${API_URL}/auth/login`, { username, password }, { withCredentials: true })
      .pipe(
        tap((res) => {
          this.currentUser.set(res.user);
          localStorage.setItem(AUTH_KEY, JSON.stringify(res.user));
          this.store.dispatch(AuthActions.loginSuccess());
        }),
      );
  }

  // Register a new user account with the backend.
  register(username: string, password: string) {
    return this.http.post<{ message: string; userId: string }>(
      `${API_URL}/auth/register`,
      { username, password },
      { withCredentials: true },
    );
  }

  // Log out the current user and clear local auth state.
  logout(): void {
    this.http.get(`${API_URL}/auth/logout`, { withCredentials: true }).subscribe();
    this.currentUser.set(null);
    localStorage.removeItem(AUTH_KEY);
    this.store.dispatch(AuthActions.logout());
    this.router.navigate(['/login']);
  }
}
