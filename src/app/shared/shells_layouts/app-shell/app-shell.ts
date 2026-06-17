import { Component, inject, computed, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CityService } from '../../../core/services/city.service';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { AuthService } from '../../../core/services/auth.service';
import { LangService } from '../../../core/services/lang.service';
import { AppNavAuth } from '../../components/app-nav-auth/app-nav-auth';
import { AppFooter } from '../../components/app-footer/app-footer';
import { AppHeader } from '../../components/app-header/app-header';
// import { AppLangSwitcher } from '../../components/_app-lang-switcher/app-lang-switcher';
import { AppPublicNav } from '../../components/app-public-nav/app-public-nav';
import { ErrorService } from '../../../core/services/error.service';
import { fadeInOut } from '../../animations/animations';

@Component({
  animations: [fadeInOut],
  selector: 'app-app-shell',
  standalone: true,
  imports: [
    AppNavAuth,
    AppPublicNav,
    AppFooter,
    AppHeader,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    TranslocoModule,
  ],
  templateUrl: './app-shell.html',
  styleUrl: './app-shell.scss',
})
export class AppShell {
  protected readonly cityService = inject(CityService);
  private readonly translocoService = inject(TranslocoService);
  protected readonly authService = inject(AuthService);
  protected readonly langService = inject(LangService);
  protected readonly errorService = inject(ErrorService);

  // Keep the current language in sync with the shell.
  currentLang = signal(this.translocoService.getActiveLang());

  protected readonly cityParams = computed(() => ({
    city: this.cityService.selectedCity()?.name,
    country: this.cityService.selectedCity()?.country,
    lat: this.cityService.selectedCity()?.lat,
    lon: this.cityService.selectedCity()?.lon,
  }));
}
