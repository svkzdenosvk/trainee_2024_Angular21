// import { Injectable, inject, signal } from '@angular/core';
// import { TranslocoService } from '@jsverse/transloco';

// @Injectable({ providedIn: 'root' })
// export class LangService {
//   private readonly translocoService = inject(TranslocoService);

//   currentLang = signal(this.translocoService.getActiveLang());

//   switchLang(lang: string): void {
//     this.translocoService.setActiveLang(lang);
//     this.currentLang.set(lang);
//   }
// }

import { Injectable, inject, signal } from '@angular/core';
import { TranslocoService } from '@jsverse/transloco';

const LANG_KEY = 'app_lang';

@Injectable({ providedIn: 'root' })
export class LangService {
  private readonly translocoService = inject(TranslocoService);

  currentLang = signal(localStorage.getItem(LANG_KEY) ?? this.translocoService.getActiveLang());

  constructor() {
    // set lang with start
    const saved = localStorage.getItem(LANG_KEY);
    if (saved) {
      this.translocoService.setActiveLang(saved);
    }
  }

  switchLang(lang: string): void {
    this.translocoService.setActiveLang(lang);
    this.currentLang.set(lang);
    localStorage.setItem(LANG_KEY, lang);
  }
}
