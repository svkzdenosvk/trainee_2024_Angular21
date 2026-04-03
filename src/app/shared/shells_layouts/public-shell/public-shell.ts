import { Component, inject, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive,Router } from '@angular/router';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { AuthService } from '../../../core/services/auth.service';
import { NavAuth } from '../../components/nav-auth/nav-auth';

@Component({
  selector: 'app-public-shell',
  imports: [NavAuth, RouterOutlet, RouterLinkActive, RouterLink, TranslocoModule],
  templateUrl: './public-shell.html',
  styleUrl: './public-shell.scss',
})
export class PublicShell {
  private readonly translocoService = inject(TranslocoService);
  protected readonly authService = inject(AuthService);
  protected readonly router = inject(Router);

  currentLang = signal(this.translocoService.getActiveLang());

  switchLang(lang: string): void {
    this.translocoService.setActiveLang(lang);
    this.currentLang.set(lang);
  }
}
