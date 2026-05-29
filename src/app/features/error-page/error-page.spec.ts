// src/app/features/error-page/error-page.spec.ts
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { TranslocoService } from '@jsverse/transloco';
import { ErrorPageComponent } from './error-page';

describe('ErrorPageComponent', () => {
  let component: ErrorPageComponent;
  let router: { navigate: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    router = { navigate: vi.fn() };

    TestBed.configureTestingModule({
      imports: [ErrorPageComponent],
      providers: [
        { provide: Router, useValue: router },
        { provide: TranslocoService, useValue: { translate: (key: string) => key } },
      ],
    });

    const fixture = TestBed.createComponent(ErrorPageComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should navigate to / on goHome', () => {
    component.goHome();
    expect(router.navigate).toHaveBeenCalledWith(['/']);
  });
});
