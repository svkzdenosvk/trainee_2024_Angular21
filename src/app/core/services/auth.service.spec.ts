import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { API_URL } from '../constants/constants';
import { Role } from '../models/role.enum';

import { provideStore } from '@ngrx/store';
import { favouritesReducer } from '../../store/favourites/favourites.reducer';

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
        provideStore({ favourites: favouritesReducer }),
      ],
    });

    service = TestBed.inject(AuthService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
    TestBed.resetTestingModule(); //  reset between tests
  });

  describe('isLoggedIn / isAdmin', () => {
    it('should be false when no user', () => {
      expect(service.isLoggedIn()).toBe(false);
      expect(service.isAdmin()).toBe(false);
    });

    it('should be true when user set', () => {
      service.currentUser.set({ id: '1', username: 'jan', role: Role.USER });
      expect(service.isLoggedIn()).toBe(true);
    });

    it('should return true for ADMIN role', () => {
      service.currentUser.set({ id: '1', username: 'admin', role: Role.ADMIN });
      expect(service.isAdmin()).toBe(true);
    });

    it('should return false for USER role', () => {
      service.currentUser.set({ id: '1', username: 'jan', role: Role.USER });
      expect(service.isAdmin()).toBe(false);
    });
  });

  describe('checkAuth', () => {
    it('should set user when isLoggedIn true', () => {
      const mockUser = { id: '1', username: 'jan', role: Role.USER };

      service.checkAuth().subscribe();

      const req = http.expectOne(`${API_URL}/auth/me`);
      expect(req.request.method).toBe('GET');
      req.flush({ isLoggedIn: true, user: mockUser });

      expect(service.currentUser()).toEqual(mockUser);
      expect(localStorage.getItem('auth_user')).toBe(JSON.stringify(mockUser));
    });

    it('should clear user when isLoggedIn false', () => {
      service.currentUser.set({ id: '1', username: 'jan', role: Role.USER });

      service.checkAuth().subscribe();

      const req = http.expectOne(`${API_URL}/auth/me`);
      req.flush({ isLoggedIn: false });

      expect(service.currentUser()).toBeNull();
      expect(localStorage.getItem('auth_user')).toBeNull();
    });
  });

  describe('login', () => {
    it('should POST to /auth/login and store user', () => {
      const mockUser = { id: '1', username: 'jan', role: Role.USER };

      service.login('jan', 'pass123').subscribe();

      const req = http.expectOne(`${API_URL}/auth/login`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ username: 'jan', password: 'pass123' });
      req.flush({ user: mockUser });

      expect(service.currentUser()).toEqual(mockUser);
      expect(localStorage.getItem('auth_user')).toBe(JSON.stringify(mockUser));
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
    it('should clear user and navigate to /login', () => {
      service.currentUser.set({ id: '1', username: 'jan', role: Role.USER });
      localStorage.setItem('auth_user', '{"username":"jan"}');

      service.logout();

      const req = http.expectOne(`${API_URL}/auth/logout`);
      req.flush({});

      expect(service.currentUser()).toBeNull();
      expect(localStorage.getItem('auth_user')).toBeNull();
      expect(router.navigate).toHaveBeenCalledWith(['/login']);
    });
  });
});
