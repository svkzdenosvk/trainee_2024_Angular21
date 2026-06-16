import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { LangService } from '../../../core/services/lang.service';

@Component({
  selector: 'app-lang-switcher',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="nav-actions" role="group" aria-label="Language selection">
      <button
        class="btn-theme"
        (click)="langService.switchLang('en')"
        [class.active]="langService.currentLang() === 'en'"
        aria-label="Switch to English"
        [attr.aria-pressed]="langService.currentLang() === 'en'"
      >
        EN
      </button>
      <button
        class="btn-theme"
        (click)="langService.switchLang('sk')"
        [class.active]="langService.currentLang() === 'sk'"
        aria-label="Switch to Slovak"
        [attr.aria-pressed]="langService.currentLang() === 'sk'"
      >
        SK
      </button>
    </div>
  `,
  styles: [
    `
      :host {
        display: contents;
      }
    `,
  ],
  styleUrl: '../../scss/_shells.scss',
})
export class AppLangSwitcher {
  // Language switcher used in navigation to toggle between English and Slovak.
  protected readonly langService = inject(LangService);
}
