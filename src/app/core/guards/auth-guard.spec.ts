import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { authGuard } from './auth-guard';
import { AuthService } from '../services/auth.service';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

const runGuard = () =>
  TestBed.runInInjectionContext(() =>
    authGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot),
  );

describe('authGuard', () => {
  let auth: AuthService;
  let router: Router;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [{ provide: Router, useValue: { navigate: vi.fn() } }],
    });
    auth = TestBed.inject(AuthService);
    router = TestBed.inject(Router);
  });

  afterEach(() => localStorage.clear());

  it('should allow access when logged in', () => {
    auth.login('user', 'user123');
    expect(runGuard()).toBe(true);
  });

  it('should deny access when not logged in', () => {
    expect(runGuard()).toBe(false);
  });

  it('should navigate to /login when not logged in', () => {
    runGuard();
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });
});
