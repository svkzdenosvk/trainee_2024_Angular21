// auth.interceptor.spec.ts
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { provideHttpClient, withInterceptors, HttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { authInterceptor } from './auth.interceptor';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

describe('authInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;
  let authService: { getToken: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    authService = { getToken: vi.fn().mockReturnValue(null) };

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: authService },
        { provide: Router, useValue: { navigate: vi.fn() } },
      ],
    });

    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should add Authorization header when token exists', () => {
    authService.getToken.mockReturnValue('my-token');
    http.get('/api/data').subscribe();
    const req = httpMock.expectOne('/api/data');
    expect(req.request.headers.get('Authorization')).toBe('Bearer my-token');
    req.flush({});
  });

  it('should NOT add header when no token', () => {
    http.get('/api/data').subscribe();
    const req = httpMock.expectOne('/api/data');
    expect(req.request.headers.get('Authorization')).toBeNull();
    req.flush({});
  });

  it('should NOT add header for open-meteo.com even with token', () => {
    authService.getToken.mockReturnValue('my-token');
    http.get('https://api.open-meteo.com/v1/forecast').subscribe();
    const req = httpMock.expectOne('https://api.open-meteo.com/v1/forecast');
    expect(req.request.headers.get('Authorization')).toBeNull();
    req.flush({});
  });

  it('should pass request through without modification when no token', () => {
    http.get('/api/public').subscribe();
    httpMock.expectOne('/api/public').flush({});
  });
});