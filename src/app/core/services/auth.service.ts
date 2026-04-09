import { Injectable, signal, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { User, UserWithStats } from '../models/user.model';

const AUTH_KEY = 'auth_user';
const USERS_KEY = 'registered_users';

const DEFAULT_USERS = [
  { id: '1', username: 'admin', password: 'admin123', role: 'admin' as const },
  { id: '2', username: 'user', password: 'user123', role: 'user' as const },
];

// @Injectable({ providedIn: 'root' })
// export class AuthService {
//   private readonly router = inject(Router);

//   currentUser = signal<User | null>(JSON.parse(localStorage.getItem(AUTH_KEY) ?? 'null'));

//   private registeredUsers = signal<any[]>(JSON.parse(localStorage.getItem(USERS_KEY) ?? '[]'));

//   readonly isLoggedIn = computed(() => this.currentUser() !== null);
//   readonly isAdmin = computed(() => this.currentUser()?.role === 'admin');

//   login(username: string, password: string): boolean {
//     // const registered = this.registeredUsers();

//     // const allUsers = [...DEFAULT_USERS, ...registered];

//     const allUsers = [...DEFAULT_USERS, ...this.registeredUsers()];

//     const found = allUsers.find(
//       (u) => u.username.toLowerCase() === username.toLowerCase() && u.password === password,
//     );

//     if (!found) return false;

//     const user: User = {
//       id: found.id,
//       username: found.username,
//       role: found.role,
//     };

//     this.currentUser.set(user);
//     localStorage.setItem(AUTH_KEY, JSON.stringify(user));

//     return true;
//   }

//   register(username: string, password: string): boolean {
//     // const registered = this.registeredUsers();

//     // const allUsers = [...DEFAULT_USERS, ...registered];

//     const allUsers = [...DEFAULT_USERS, ...this.registeredUsers()];

//     // Case-insensitive check
//     const exists = allUsers.some((u) => u.username.toLowerCase() === username.toLowerCase());

//     if (exists) return false;

//     const newUser = {
//       id: Date.now().toString(),
//       username,
//       password,
//       role: 'user' as const,
//     };

//     // registered.push(newUser);
//     const updated = [...this.registeredUsers(), newUser];
//     this.registeredUsers.set(updated);
//     localStorage.setItem(USERS_KEY, JSON.stringify(updated));
//     return true;
//   }

//   logout(): void {
//     this.currentUser.set(null);
//     localStorage.removeItem(AUTH_KEY);
//     this.router.navigate(['/login']);
//   }

//   // private getRegisteredUsers(): any[] {
//   //   return JSON.parse(localStorage.getItem(USERS_KEY) ?? '[]');
//   // }

//   //admin methods

//   // computed pre admin dashboard - reaktívny
//   readonly allUsersWithStats = computed<UserWithStats[]>(() => {
//     const allUsers = [...DEFAULT_USERS, ...this.registeredUsers()];
//     return allUsers.map((u) => ({
//       id: u.id,
//       username: u.username,
//       role: u.role,
//       favouritesCount: JSON.parse(localStorage.getItem(`favourites_${u.id}`) ?? '[]').length,
//     }));
//   });

//   // getAllUsersForAdmin(): UserWithStats[] {
//   //   const registered = this.getRegisteredUsers();
//   //   const allUsers = [...DEFAULT_USERS, ...registered];

//   //   return allUsers.map((u) => ({
//   //     id: u.id,
//   //     username: u.username,
//   //     role: u.role,
//   //     favouritesCount: JSON.parse(localStorage.getItem(`favourites_${u.id}`) ?? '[]').length,
//   //   }));
//   // }
//   deleteUser(id: string): void {
//     const updated = this.registeredUsers().filter((u) => u.id !== id);
//     this.registeredUsers.set(updated);
//     localStorage.setItem(USERS_KEY, JSON.stringify(updated));
//     localStorage.removeItem(`favourites_${id}`);
//   }

//   // deleteUser(id: string): void {
//   //   const registered = this.getRegisteredUsers().filter((u) => u.id !== id);
//   //   localStorage.setItem(USERS_KEY, JSON.stringify(registered));
//   //   localStorage.removeItem(`favourites_${id}`);
//   //   // trigger signal update
//   //   const current = this.currentUser();
//   //   this.currentUser.set(null);
//   //   this.currentUser.set(current);
//   // }

//   updateRole(id: string, role: 'admin' | 'user'): void {
//     const updated = this.registeredUsers().map((u) => (u.id === id ? { ...u, role } : u));
//     this.registeredUsers.set(updated);
//     localStorage.setItem(USERS_KEY, JSON.stringify(updated));
//   }
//   // updateRole(id: string, role: 'admin' | 'user'): void {
//   //   const registered = this.getRegisteredUsers().map((u) => (u.id === id ? { ...u, role } : u));
//   //   localStorage.setItem(USERS_KEY, JSON.stringify(registered));
//   //   const current = this.currentUser();
//   //   this.currentUser.set(null);
//   //   this.currentUser.set(current);
//   // }
// }

const DEFAULT_USER_IDS = ['1', '2'];

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly router = inject(Router);
  currentUser = signal<User | null>(JSON.parse(localStorage.getItem(AUTH_KEY) ?? 'null'));
  private statsVersion = signal(0);

  private registeredUsers = signal<any[]>(this.initUsers());

  // seed - ak localStorage prázdny, vlož DEFAULT_USERS
  private initUsers(): any[] {
    const stored = JSON.parse(localStorage.getItem(USERS_KEY) ?? '[]');
    if (stored.length === 0) {
      localStorage.setItem(USERS_KEY, JSON.stringify(DEFAULT_USERS));
      return DEFAULT_USERS;
    }
    return stored;
  }

  // readonly allUsersWithStats = computed<UserWithStats[]>(() =>
  //   this.registeredUsers().map(u => ({
  //     id: u.id,
  //     username: u.username,
  //     role: u.role,
  //     favouritesCount: JSON.parse(
  //       localStorage.getItem(`favourites_${u.id}`) ?? '[]'
  //     ).length,
  //   }))
  // );

  readonly allUsersWithStats = computed<UserWithStats[]>(() => {
    this.statsVersion(); // dependency pre refresh
    return this.registeredUsers().map((u) => ({
      id: u.id,
      username: u.username,
      role: u.role,
      favouritesCount: JSON.parse(localStorage.getItem(`favourites_${u.id}`) ?? '[]').length,
    }));
  });

  refreshStats(): void {
    this.statsVersion.update((v) => v + 1);
  }

  readonly isLoggedIn = computed(() => this.currentUser() !== null);
  readonly isAdmin = computed(() => this.currentUser()?.role === 'admin');

  // login - už len registeredUsers, žiadny merge
  login(username: string, password: string): boolean {
    const found = this.registeredUsers().find(
      (u) => u.username.toLowerCase() === username.toLowerCase() && u.password === password,
    );
    if (!found) return false;
    const user: User = { id: found.id, username: found.username, role: found.role };
    this.currentUser.set(user);
    localStorage.setItem(AUTH_KEY, JSON.stringify(user));
    return true;
  }

  register(username: string, password: string): boolean {
    const exists = this.registeredUsers().some(
      (u) => u.username.toLowerCase() === username.toLowerCase(),
    );
    if (exists) return false;
    const newUser = { id: Date.now().toString(), username, password, role: 'user' as const };
    const updated = [...this.registeredUsers(), newUser];
    this.registeredUsers.set(updated);
    localStorage.setItem(USERS_KEY, JSON.stringify(updated));
    return true;
  }

  deleteUser(id: string): void {
    const updated = this.registeredUsers().filter((u) => u.id !== id);
    this.registeredUsers.set(updated);
    localStorage.setItem(USERS_KEY, JSON.stringify(updated));
    localStorage.removeItem(`favourites_${id}`);
  }

  updateRole(id: string, role: 'admin' | 'user'): void {
    const updated = this.registeredUsers().map((u) => (u.id === id ? { ...u, role } : u));
    this.registeredUsers.set(updated);
    localStorage.setItem(USERS_KEY, JSON.stringify(updated));
  }

  canChangeRole(targetUser: UserWithStats): boolean {
    // return this.currentUser()?.id !== targetUser.id;

    const current = this.currentUser();
    if (!current) return false;
    if (current.id === targetUser.id) return false;
    if (DEFAULT_USER_IDS.includes(targetUser.id)) return false;
    return true;
  }

  canDelete(targetUser: UserWithStats): boolean {
    // const current = this.currentUser();
    // if (!current) return false;
    // if (current.id === targetUser.id) return false;
    // // admin s id '1' je protected
    // return targetUser.id !== '1';
    const current = this.currentUser();
    if (!current) return false;
    if (DEFAULT_USER_IDS.includes(targetUser.id)) return false;
    return true;
  }

  logout(): void {
    this.currentUser.set(null);
    localStorage.removeItem(AUTH_KEY);
    this.router.navigate(['/login']);
  }
}
