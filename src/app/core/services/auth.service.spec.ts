import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';
import { provideRouter } from '@angular/router';
import { Router } from '@angular/router';

describe('AuthService', () => {
  let service: AuthService;
  let router: Router;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideRouter([]), { provide: Router, useValue: { navigate: vi.fn() } }],
    });
    service = TestBed.inject(AuthService);
    router = TestBed.inject(Router);
  });

  afterEach(() => localStorage.clear());

  describe('login', () => {
    it('should login with default admin credentials', () => {
      expect(service.login('admin', 'admin123')).toBe(true);
      expect(service.currentUser()?.username).toBe('admin');
      expect(service.currentUser()?.role).toBe('admin');
    });

    it('should login with default user credentials', () => {
      expect(service.login('user', 'user123')).toBe(true);
      expect(service.currentUser()?.role).toBe('user');
    });

    it('should fail with wrong password', () => {
      expect(service.login('admin', 'wrongpass')).toBe(false);
      expect(service.currentUser()).toBeNull();
    });

    it('should be case-insensitive for username', () => {
      expect(service.login('ADMIN', 'admin123')).toBe(true);
    });

    it('should set isLoggedIn after login', () => {
      service.login('admin', 'admin123');
      expect(service.isLoggedIn()).toBe(true);
    });

    it('should set isAdmin for admin user', () => {
      service.login('admin', 'admin123');
      expect(service.isAdmin()).toBe(true);
    });

    it('should not set isAdmin for regular user', () => {
      service.login('user', 'user123');
      expect(service.isAdmin()).toBe(false);
    });
  });

  describe('register', () => {
    it('should register new user', () => {
      expect(service.register('newuser', 'Password1')).toBe(true);
    });

    it('should not register duplicate username', () => {
      service.register('newuser', 'Password1');
      expect(service.register('newuser', 'Password1')).toBe(false);
    });

    it('should not register with existing default username', () => {
      expect(service.register('admin', 'Password1')).toBe(false);
    });

    it('should be case-insensitive for duplicate check', () => {
      expect(service.register('ADMIN', 'Password1')).toBe(false);
    });

    it('should allow login after register', () => {
      service.register('newuser', 'Password1');
      expect(service.login('newuser', 'Password1')).toBe(true);
    });
  });

  describe('logout', () => {
    it('should clear currentUser after logout', () => {
      service.login('admin', 'admin123');
      service.logout();
      expect(service.currentUser()).toBeNull();
      expect(service.isLoggedIn()).toBe(false);
    });
  });

  describe('canDelete', () => {
    it('should not delete default users', () => {
      service.login('admin', 'admin123');
      const users = service.allUsersWithStats();
      const defaultUser = users.find((u) => u.id === '2')!;
      expect(service.canDelete(defaultUser)).toBe(false);
    });

    it('should allow delete of registered user', () => {
      service.register('testuser', 'Password1');
      service.login('admin', 'admin123');
      const users = service.allUsersWithStats();
      const testUser = users.find((u) => u.username === 'testuser')!;
      expect(service.canDelete(testUser)).toBe(true);
    });
  });

  describe('canChangeRole', () => {
    it('should not change own role', () => {
      service.login('admin', 'admin123');
      const users = service.allUsersWithStats();
      const adminUser = users.find((u) => u.username === 'admin')!;
      expect(service.canChangeRole(adminUser)).toBe(false);
    });

    it('should allow changing role of other user', () => {
      service.register('testuser', 'Password1');
      service.login('admin', 'admin123');
      const users = service.allUsersWithStats();
      const testUser = users.find((u) => u.username === 'testuser')!;
      expect(service.canChangeRole(testUser)).toBe(true);
    });
  });

  describe('updateRole', () => {
    it('should promote user to admin', () => {
      service.register('testuser', 'Password1');
      const users = service.allUsersWithStats();
      const testUser = users.find((u) => u.username === 'testuser')!;
      service.updateRole(testUser.id, 'admin');
      const updated = service.allUsersWithStats().find((u) => u.username === 'testuser')!;
      expect(updated.role).toBe('admin');
    });
  });

  describe('deleteUser', () => {
    it('should remove user from list', () => {
      service.register('testuser', 'Password1');
      const users = service.allUsersWithStats();
      const testUser = users.find((u) => u.username === 'testuser')!;
      service.deleteUser(testUser.id);
      const after = service.allUsersWithStats().find((u) => u.username === 'testuser');
      expect(after).toBeUndefined();
    });
  });
});
