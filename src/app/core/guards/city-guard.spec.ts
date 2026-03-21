import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { cityGuard } from './city-guard';

describe('cityGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => cityGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
