import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { inject } from '@angular/core';
import { CityService } from '../services/city.service';

export const cityGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const cityService = inject(CityService);
  const router = inject(Router);

  // Allow access if a city is already selected in memory.
  if (cityService.selectedCity()) return true;

  // Try to load the city from query params if not already selected.
  const valid = cityService.loadFromUrl(route.queryParams);
  if (valid) return true;

  // No valid city was available → redirect to home.
  router.navigate(['/']);
  return false;
};
