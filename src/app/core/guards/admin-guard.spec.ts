import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { adminGuard } from './admin-guard';
import { AuthService } from '../services/auth.service';

describe('adminGuard', () => {
  let router: { navigate: ReturnType<typeof vi.fn> };
  let isLoggedIn: ReturnType<typeof vi.fn>;
  let isAdmin: ReturnType<typeof vi.fn>;

  const runGuard = () =>
    TestBed.runInInjectionContext(() => adminGuard({} as any, {} as any));

  beforeEach(() => {
    router = { navigate: vi.fn() };
    isLoggedIn = vi.fn().mockReturnValue(false);
    isAdmin = vi.fn().mockReturnValue(false);

    TestBed.configureTestingModule({
      providers: [
        { provide: Router, useValue: router },
        { provide: AuthService, useValue: { isLoggedIn, isAdmin } },
      ],
    });
  });

  it('should allow access for admin user', () => {
    isLoggedIn.mockReturnValue(true);
    isAdmin.mockReturnValue(true);
    expect(runGuard()).toBe(true);
  });

  it('should deny access for regular user', () => {
    isLoggedIn.mockReturnValue(true);
    isAdmin.mockReturnValue(false);
    expect(runGuard()).toBe(false);
  });

  it('should deny access when not logged in', () => {
    expect(runGuard()).toBe(false);
  });

  it('should navigate to / when not admin', () => {
    isLoggedIn.mockReturnValue(true);
    runGuard();
    expect(router.navigate).toHaveBeenCalledWith(['/']);
  });

  it('should navigate to / when not logged in', () => {
    runGuard();
    expect(router.navigate).toHaveBeenCalledWith(['/']);
  });
});