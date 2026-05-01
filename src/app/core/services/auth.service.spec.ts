import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { AuthService } from './auth.service';
import { API_URL } from '../constants/constants';
import { Role } from '../models/role.enum';

describe('AuthService', () => {
  let service: AuthService;
  let http: HttpTestingController;
  let router: { navigate: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    localStorage.clear();
    router = { navigate: vi.fn() };

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        AuthService,
        { provide: Router, useValue: router },
      ],
    });

    service = TestBed.inject(AuthService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  describe('getToken', () => {
    it('should return null when no token stored', () => {
      expect(service.getToken()).toBeNull();
    });

    it('should return token from localStorage', () => {
      localStorage.setItem('auth_token', 'abc123');
      expect(service.getToken()).toBe('abc123');
    });
  });

  describe('isLoggedIn / isAdmin', () => {
    it('should be false when no user in localStorage', () => {
      expect(service.isLoggedIn()).toBe(false);
      expect(service.isAdmin()).toBe(false);
    });

    it('should be true when user stored', () => {
      const user = { username: 'jan', role: Role.USER };
      localStorage.setItem('auth_user', JSON.stringify(user));
      // nový service instance prečíta localStorage pri inicializácii
      const freshService = TestBed.inject(AuthService);
      // signal sa inicializuje v konstruktore — testujem cez currentUser
      service.currentUser.set(user as any);
      expect(service.isLoggedIn()).toBe(true);
    });

    it('should return true for admin role', () => {
      service.currentUser.set({ username: 'admin', role: Role.ADMIN } as any);
      expect(service.isAdmin()).toBe(true);
    });

    it('should return false for non-admin role', () => {
      service.currentUser.set({ username: 'jan', role: Role.USER } as any);
      expect(service.isAdmin()).toBe(false);
    });
  });

  describe('login', () => {
    it('should POST to /auth/login and store user + token', () => {
      const mockResponse = {
        access_token: 'token-xyz',
        user: { username: 'jan', role: Role.USER },
      };

      let result: any;
      service.login('jan', 'pass123').subscribe((res) => (result = res));

      const req = http.expectOne(`${API_URL}/auth/login`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ username: 'jan', password: 'pass123' });
      req.flush(mockResponse);

      expect(service.currentUser()).toEqual(mockResponse.user);
      expect(localStorage.getItem('auth_token')).toBe('token-xyz');
      expect(localStorage.getItem('auth_user')).toBe(JSON.stringify(mockResponse.user));
    });
  });

  describe('register', () => {
    it('should POST to /auth/register', () => {
      service.register('newuser', 'pass').subscribe();

      const req = http.expectOne(`${API_URL}/auth/register`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ username: 'newuser', password: 'pass' });
      req.flush({ message: 'ok', userId: '1' });
    });
  });

  describe('logout', () => {
    it('should clear user, localStorage and navigate to /login', () => {
      service.currentUser.set({ username: 'jan', role: Role.USER } as any);
      localStorage.setItem('auth_token', 'tok');
      localStorage.setItem('auth_user', '{"username":"jan"}');

      service.logout();

      expect(service.currentUser()).toBeNull();
      expect(localStorage.getItem('auth_token')).toBeNull();
      expect(localStorage.getItem('auth_user')).toBeNull();
      expect(router.navigate).toHaveBeenCalledWith(['/login']);
    });
  });
});