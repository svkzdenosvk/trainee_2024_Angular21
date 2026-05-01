import { TestBed } from '@angular/core/testing';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { authGuard } from './auth-guard';
import { AuthService } from '../services/auth.service';

describe('authGuard', () => {
  let router: { navigate: ReturnType<typeof vi.fn> };
  let isLoggedIn: ReturnType<typeof vi.fn>;

  const runGuard = () =>
    TestBed.runInInjectionContext(() =>
      authGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot),
    );

  beforeEach(() => {
    router = { navigate: vi.fn() };
    isLoggedIn = vi.fn().mockReturnValue(false);

    TestBed.configureTestingModule({
      providers: [
        { provide: Router, useValue: router },
        { provide: AuthService, useValue: { isLoggedIn } },
      ],
    });
  });

  it('should allow access when logged in', () => {
    isLoggedIn.mockReturnValue(true);
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