import { TestBed } from '@angular/core/testing';
import { Router, ActivatedRouteSnapshot } from '@angular/router';
import { cityGuard } from './city-guard';
import { CityService } from '../services/city.service';

const runGuard = (params = {}) => {
  const route = { queryParams: params } as ActivatedRouteSnapshot;
  return TestBed.runInInjectionContext(() => cityGuard(route, {} as any));
};

describe('cityGuard', () => {
  let cityService: CityService;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [{ provide: Router, useValue: { navigate: vi.fn() } }],
    });
    cityService = TestBed.inject(CityService);
    router = TestBed.inject(Router);
  });

  it('should allow access when city already in memory', () => {
    cityService.selectCity({ name: 'London', country: 'UK', lat: 51.5, lon: -0.1 });
    expect(runGuard()).toBe(true);
  });

  it('should allow access when valid city in URL params', () => {
    expect(runGuard({ city: 'London', country: 'UK', lat: '51.5', lon: '-0.1' })).toBe(true);
  });

  it('should deny access and redirect when no city anywhere', () => {
    expect(runGuard()).toBe(false);
    expect(router.navigate).toHaveBeenCalledWith(['/']);
  });

  it('should deny access for invalid URL params', () => {
    expect(runGuard({ city: 'London', lat: 'abc', lon: 'xyz' })).toBe(false);
  });
});
