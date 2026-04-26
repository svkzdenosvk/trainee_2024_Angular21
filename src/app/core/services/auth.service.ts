import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs';

import { User /*, UserWithStats */ } from '../models/user.model';

const AUTH_KEY = 'auth_user';
const TOKEN_KEY = 'auth_token';
const API_URL = 'http://localhost:3000';

// const AUTH_KEY = 'auth_user';
// const USERS_KEY = 'registered_users';

// const DEFAULT_USERS = [
//   { id: '1', username: 'admin', password: 'admin123', role: 'admin' as const },
//   { id: '2', username: 'user', password: 'user123', role: 'user' as const },
// ];

// const DEFAULT_USER_IDS = ['1', '2'];

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly router = inject(Router);
  private readonly http = inject(HttpClient);

  currentUser = signal<User | null>(JSON.parse(localStorage.getItem(AUTH_KEY) ?? 'null'));
  
  readonly isLoggedIn = computed(() => this.currentUser() !== null);
  readonly isAdmin = computed(() => this.currentUser()?.role === 'admin');

   getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  // private statsVersion = signal(0);
  // private registeredUsers = signal<any[]>(this.initUsers());

  // init users from localstorage - if localStorage is empty, insert DEFAULT_USERS
  // private initUsers(): any[] {
  //   const stored = JSON.parse(localStorage.getItem(USERS_KEY) ?? '[]');
  //   if (stored.length === 0) {
  //     localStorage.setItem(USERS_KEY, JSON.stringify(DEFAULT_USERS));
  //     return DEFAULT_USERS;
  //   }
  //   return stored;
  // }

  //all users with count of favourites - for admin dashboard
  // readonly allUsersWithStats = computed<UserWithStats[]>(() => {
  //   this.statsVersion(); // dependency for refresh
  //   return this.registeredUsers().map((u) => ({
  //     id: u.id,
  //     username: u.username,
  //     role: u.role,
  //     favouritesCount: JSON.parse(localStorage.getItem(`favourites_${u.id}`) ?? '[]').length,
  //   }));
  // });

  // refreshStats(): void {
  //   this.statsVersion.update((v) => v + 1);
  // }

  // readonly isLoggedIn = computed(() => this.currentUser() !== null);
  // readonly isAdmin = computed(() => this.currentUser()?.role === 'admin');

  login(username: string, password: string) {
    return this.http.post<{ access_token: string; user: User }>(
      `${API_URL}/auth/login`,
      { username, password }
    ).pipe(
      tap(res => {
        this.currentUser.set(res.user);
        localStorage.setItem(AUTH_KEY, JSON.stringify(res.user));
        localStorage.setItem(TOKEN_KEY, res.access_token);
      })
    );
  }

   register(username: string, password: string) {
    return this.http.post<{ message: string; userId: string }>(
      `${API_URL}/auth/register`,
      { username, password }
    );
  }

  logout(): void {
    this.currentUser.set(null);
    localStorage.removeItem(AUTH_KEY);
    localStorage.removeItem(TOKEN_KEY);
    this.router.navigate(['/login']);
  }

  // deleteUser(id: string): void {
  //   const updated = this.registeredUsers().filter((u) => u.id !== id);
  //   this.registeredUsers.set(updated);
  //   localStorage.setItem(USERS_KEY, JSON.stringify(updated));
  //   localStorage.removeItem(`favourites_${id}`);
  // }

  // updateRole(id: string, role: 'admin' | 'user'): void {
  //   const updated = this.registeredUsers().map((u) => (u.id === id ? { ...u, role } : u));
  //   this.registeredUsers.set(updated);
  //   localStorage.setItem(USERS_KEY, JSON.stringify(updated));
  // }

  // canChangeRole(targetUser: UserWithStats): boolean {
  //   const current = this.currentUser();
  //   if (!current) return false;
  //   if (current.id === targetUser.id) return false;
  //   if (DEFAULT_USER_IDS.includes(targetUser.id)) return false;
  //   return true;
  // }

  // canDelete(targetUser: UserWithStats): boolean {
  //   const current = this.currentUser();
  //   if (!current) return false;
  //   if (DEFAULT_USER_IDS.includes(targetUser.id)) return false;
  //   return true;
  // }

  //login register functions
  // login(username: string, password: string): boolean {
  //   const found = this.registeredUsers().find(
  //     (u) => u.username.toLowerCase() === username.toLowerCase() && u.password === password,
  //   );
  //   if (!found) return false;
  //   const user: User = { id: found.id, username: found.username, role: found.role };
  //   this.currentUser.set(user);
  //   localStorage.setItem(AUTH_KEY, JSON.stringify(user));
  //   return true;
  // }

  // register(username: string, password: string): boolean {
  //   const exists = this.registeredUsers().some(
  //     (u) => u.username.toLowerCase() === username.toLowerCase(),
  //   );
  //   if (exists) return false;
  //   const newUser = { id: Date.now().toString(), username, password, role: 'user' as const };
  //   const updated = [...this.registeredUsers(), newUser];
  //   this.registeredUsers.set(updated);
  //   localStorage.setItem(USERS_KEY, JSON.stringify(updated));
  //   return true;
  // }

  // logout(): void {
  //   this.currentUser.set(null);
  //   localStorage.removeItem(AUTH_KEY);
  //   this.router.navigate(['/login']);
  // }
}
