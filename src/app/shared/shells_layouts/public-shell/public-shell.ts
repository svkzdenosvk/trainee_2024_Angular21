import { Component, inject, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';

@Component({
  selector: 'app-public-shell',
  imports: [RouterOutlet, RouterLinkActive, RouterLink, TranslocoModule],
  templateUrl: './public-shell.html',
  styleUrl: './public-shell.scss',
})
export class PublicShell {
  private readonly translocoService = inject(TranslocoService);

  currentLang = signal(this.translocoService.getActiveLang());

  switchLang(lang: string): void {
    this.translocoService.setActiveLang(lang);
    this.currentLang.set(lang);
  }
}
