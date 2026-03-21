import { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { CityService } from '../services/city.service';

export const cityGuard: CanActivateFn = () => {
  const cityService = inject(CityService);
  const router = inject(Router);

  if (!cityService.selectedCity()) {
    router.navigate(['/']);
    return false;
  }

  return true;
};
