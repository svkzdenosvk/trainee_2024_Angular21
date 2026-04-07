import { Component, inject } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { TranslocoModule } from '@jsverse/transloco';
import { AuthService } from '../../../core/services/auth.service';
import { LangService } from '../../../core/services/lang.service';
import { AppNavAuth } from '../../components/app-nav-auth/app-nav-auth';
import { AppFooter } from '../../components/app-footer/app-footer';
import { AppHeader } from '../../components/app-header/app-header';
import { AppLangSwitcher } from '../../components/_app-lang-switcher/app-lang-switcher';
import { AppPublicNav } from '../../components/app-public-nav/app-public-nav';

@Component({
  selector: 'app-public-shell',
  imports: [
    AppNavAuth,
    AppPublicNav,
    // AppLangSwitcher,
    AppFooter,
    AppHeader,
    RouterOutlet,
    // RouterLinkActive,
    // RouterLink,
    TranslocoModule,
  ],
  templateUrl: './public-shell.html',
  styleUrl: './public-shell.scss',
})
export class PublicShell {
  protected readonly authService = inject(AuthService);
  protected readonly langService = inject(LangService);
}
