import { Injectable, inject, signal } from '@angular/core';
import { TranslocoService } from '@jsverse/transloco';

@Injectable({ providedIn: 'root' })
export class LangService {
  private readonly translocoService = inject(TranslocoService);
  
  currentLang = signal(this.translocoService.getActiveLang());

  switchLang(lang: string): void {
    this.translocoService.setActiveLang(lang);
    this.currentLang.set(lang);
  }
}