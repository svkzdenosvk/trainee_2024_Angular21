import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { LangService } from '../../../core/services/lang.service';

@Component({
  selector: 'app-lang-switcher',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="nav-actions">
      <button
        class="btn-theme"
        (click)="langService.switchLang('en')"
        [class.active]="langService.currentLang() === 'en'"
      >
        EN
      </button>
      <button
        class="btn-theme"
        (click)="langService.switchLang('sk')"
        [class.active]="langService.currentLang() === 'sk'"
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
