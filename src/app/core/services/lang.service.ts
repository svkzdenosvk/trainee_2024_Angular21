import { Injectable, inject, signal } from '@angular/core';
import { TranslocoService } from '@jsverse/transloco';

const LANG_KEY = 'app_lang';

@Injectable({ providedIn: 'root' })
export class LangService {
  private readonly translocoService = inject(TranslocoService);

  // Keep the active language in a signal so UI can react to changes.
  currentLang = signal(localStorage.getItem(LANG_KEY) ?? this.translocoService.getActiveLang());

  constructor() {
    // Set lang with start
    const saved = localStorage.getItem(LANG_KEY);
    if (saved) {
      this.translocoService.setActiveLang(saved);
    }
  }

  // Switch the active language and persist the selected locale.
  switchLang(lang: string): void {
    this.translocoService.setActiveLang(lang);
    this.currentLang.set(lang);
    localStorage.setItem(LANG_KEY, lang);
  }
}
