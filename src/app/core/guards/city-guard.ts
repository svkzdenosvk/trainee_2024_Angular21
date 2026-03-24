import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { inject } from '@angular/core';
import { CityService } from '../services/city.service';

export const cityGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const cityService = inject(CityService);
  const router = inject(Router);

  // City already in memory
  if (cityService.selectedCity()) return true;

 // Try to load from URL params
  const valid = cityService.loadFromUrl(route.queryParams);
  if (valid) return true;

// No city anywhere → redirect home
  router.navigate(['/']);
  return false;

  // if (!cityService.selectedCity()) {
  //   router.navigate(['/']);
  //   return false;
  // }

  return true;
};
