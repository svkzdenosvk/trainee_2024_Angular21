import { Component, inject } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { TranslocoModule } from '@jsverse/transloco';
import { AuthService } from '../../../core/services/auth.service';
import { LangService } from '../../../core/services/lang.service';
import { NavAuth } from '../../components/nav-auth/nav-auth';
import { AppFooter } from '../../components/app-footer/app-footer';
import { AppHeader } from '../../components/app-header/app-header';
import { LangSwitcher } from '../../components/lang-switcher/lang-switcher';

@Component({
  selector: 'app-public-shell',
  imports: [
    NavAuth,
    LangSwitcher,
    AppFooter,
    AppHeader,
    RouterOutlet,
    RouterLinkActive,
    RouterLink,
    TranslocoModule,
  ],
  templateUrl: './public-shell.html',
  styleUrl: './public-shell.scss',
})
export class PublicShell {
  protected readonly authService = inject(AuthService);
  protected readonly langService = inject(LangService);
}
