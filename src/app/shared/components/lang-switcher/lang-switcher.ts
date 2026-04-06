import { Component, inject } from '@angular/core';
import { LangService } from '../../../core/services/lang.service';

@Component({
  selector: 'app-lang-switcher',
  standalone: true,
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
export class LangSwitcher {
  protected readonly langService = inject(LangService);
}
