import { Component, inject, computed, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { CityService } from '../../../core/services/city.service';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { AuthService } from '../../../core/services/auth.service';
import { LangService } from '../../../core/services/lang.service';
import { NavAuth } from '../../components/nav-auth/nav-auth';
import { AppFooter } from '../../components/app-footer/app-footer';
import { AppHeader } from '../../components/app-header/app-header';
import { LangSwitcher } from '../../components/lang-switcher/lang-switcher';

@Component({
  selector: 'app-app-shell',
  standalone: true,
  imports: [
    NavAuth,
    LangSwitcher,
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

  currentLang = signal(this.translocoService.getActiveLang());

  protected readonly cityParams = computed(() => ({
    city: this.cityService.selectedCity()?.name,
    country: this.cityService.selectedCity()?.country,
    lat: this.cityService.selectedCity()?.lat,
    lon: this.cityService.selectedCity()?.lon,
  }));
}
