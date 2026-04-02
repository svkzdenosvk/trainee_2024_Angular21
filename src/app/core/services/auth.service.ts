// import { Injectable, inject, signal, computed } from '@angular/core';
// import { Router } from '@angular/router';

// export interface User {
//   username: string;
//   role: 'admin' | 'user';
//   token: string;
// }

// const STORAGE_KEY = 'auth_user';

// const USERS = [
//   { username: 'admin', password: 'admin123', role: 'admin' as const },
//   { username: 'user', password: 'user123', role: 'user' as const }
// ];

// @Injectable({ providedIn: 'root' })
// export class AuthService {
//   private readonly router = inject(Router);

//   currentUser = signal<User | null>(
//     JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null')
//   );

//   readonly isLoggedIn = computed(() => this.currentUser() !== null);
//   readonly isAdmin = computed(() => this.currentUser()?.role === 'admin');

//   login(username: string, password: string): boolean {
//     const found = USERS.find(
//       u => u.username === username && u.password === password
//     );

//     if (!found) return false;

//     const user: User = {
//       username: found.username,
//       role: found.role,
//       token: `fake-jwt-${found.username}-${Date.now()}`
//     };

//     this.currentUser.set(user);
//     localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
//     return true;
//   }

//   logout(): void {
//     this.currentUser.set(null);
//     localStorage.removeItem(STORAGE_KEY);
//     this.router.navigate(['/login']);
//   }
// }

import { Injectable, signal, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
// import { FavouritesService } from './favourites.service';

export interface User {
  id: string;
  username: string;
  role: 'admin' | 'user';
}

const AUTH_KEY = 'auth_user';
const USERS_KEY = 'registered_users';

const DEFAULT_USERS = [
  { id: '1', username: 'admin', password: 'admin123', role: 'admin' as const },
  { id: '2', username: 'user', password: 'user123', role: 'user' as const }
];

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly router = inject(Router);
// private readonly favouritesService = inject(FavouritesService);


  currentUser = signal<User | null>(
    JSON.parse(localStorage.getItem(AUTH_KEY) ?? 'null')
  );

  readonly isLoggedIn = computed(() => this.currentUser() !== null);
  readonly isAdmin = computed(() => this.currentUser()?.role === 'admin');

  login(username: string, password: string): boolean {
    const registered = this.getRegisteredUsers();
    const allUsers = [...DEFAULT_USERS, ...registered];

    const found = allUsers.find(
      u =>
        u.username.toLowerCase() === username.toLowerCase() &&
        u.password === password
    );

    if (!found) return false;

    const user: User = {
      id: found.id,
      username: found.username,
      role: found.role
    };

    this.currentUser.set(user);
    localStorage.setItem(AUTH_KEY, JSON.stringify(user));
    // Reload favourites pre tohto usera
  // this.favouritesService.reloadForUser();
  
  
    return true;

  }

  register(username: string, password: string): boolean {
    const registered = this.getRegisteredUsers();
    const allUsers = [...DEFAULT_USERS, ...registered];

    // Case-insensitive check
    const exists = allUsers.some(
      u => u.username.toLowerCase() === username.toLowerCase()
    );

    if (exists) return false;

    const newUser = {
      id: Date.now().toString(),
      username,
      password,
      role: 'user' as const
    };

    registered.push(newUser);
    localStorage.setItem(USERS_KEY, JSON.stringify(registered));
    return true;
  }

  logout(): void {
    this.currentUser.set(null);
    localStorage.removeItem(AUTH_KEY);
    this.router.navigate(['/login']);
  }

  private getRegisteredUsers(): any[] {
    return JSON.parse(localStorage.getItem(USERS_KEY) ?? '[]');
  }
}