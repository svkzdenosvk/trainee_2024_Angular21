import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { adminGuard } from './admin-guard';
import { AuthService } from '../services/auth.service';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

const runGuard = () =>
  TestBed.runInInjectionContext(() =>
    adminGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot)
  );

describe('adminGuard', () => {
  let auth: AuthService;
  let router: Router;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [{ provide: Router, useValue: { navigate: vi.fn() } }]
    });
    auth = TestBed.inject(AuthService);
    router = TestBed.inject(Router);
  });

  afterEach(() => localStorage.clear());

  it('should allow access for admin user', () => {
    auth.login('admin', 'admin123');
    expect(runGuard()).toBe(true);
  });

  it('should deny access for regular user', () => {
    auth.login('user', 'user123');
    expect(runGuard()).toBe(false);
  });

  it('should deny access when not logged in', () => {
    expect(runGuard()).toBe(false);
  });

  it('should navigate to / when not admin', () => {
    auth.login('user', 'user123');
    runGuard();
    expect(router.navigate).toHaveBeenCalledWith(['/']);
  });

  it('should navigate to / when not logged in', () => {
    runGuard();
    expect(router.navigate).toHaveBeenCalledWith(['/']);
  });
});