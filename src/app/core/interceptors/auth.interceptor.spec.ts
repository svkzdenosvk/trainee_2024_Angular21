import { TestBed } from '@angular/core/testing';
import { HttpTestingController } from '@angular/common/http/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { authInterceptor } from './auth.interceptor';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

describe('authInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;
  let authService: { logout: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    authService = { logout: vi.fn() };

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

  it('should add withCredentials to non-external requests', () => {
    http.get('/api/data').subscribe();
    const req = httpMock.expectOne('/api/data');
    expect(req.request.withCredentials).toBe(true);
    req.flush({});
  });

  it('should NOT add withCredentials for open-meteo.com', () => {
    http.get('https://geocoding-api.open-meteo.com/v1/search').subscribe();
    const req = httpMock.expectOne('https://geocoding-api.open-meteo.com/v1/search');
    expect(req.request.withCredentials).toBe(false);
    req.flush({});
  });

  it('should NOT add withCredentials for nominatim', () => {
    http.get('https://nominatim.openstreetmap.org/reverse').subscribe();
    const req = httpMock.expectOne('https://nominatim.openstreetmap.org/reverse');
    expect(req.request.withCredentials).toBe(false);
    req.flush({});
  });

  it('should call logout on 401 error', () => {
    http.get('/api/data').subscribe({ error: () => {} });
    const req = httpMock.expectOne('/api/data');
    req.flush({}, { status: 401, statusText: 'Unauthorized' });
    expect(authService.logout).toHaveBeenCalled();
  });

  it('should NOT logout on 401 for /users/me PATCH', () => {
    http.patch('/users/me', {}).subscribe({ error: () => {} });
    const req = httpMock.expectOne('/users/me');
    req.flush({}, { status: 401, statusText: 'Unauthorized' });
    expect(authService.logout).not.toHaveBeenCalled();
  });
});
