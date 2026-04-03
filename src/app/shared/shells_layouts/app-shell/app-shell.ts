import { Component, inject, computed, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { CityService } from '../../../core/services/city.service';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
// import { AuthService } from '../../../core/services/auth.service';
import { NavAuth } from '../../components/nav-auth/nav-auth';

@Component({
  selector: 'app-app-shell',
  standalone: true,
  imports: [NavAuth,RouterOutlet, RouterLink, RouterLinkActive, TranslocoModule],
  templateUrl: './app-shell.html',
  styleUrl: './app-shell.scss',
})
export class AppShell {
  protected readonly cityService = inject(CityService);
  private readonly translocoService = inject(TranslocoService);

  currentLang = signal(this.translocoService.getActiveLang());

  protected readonly cityParams = computed(() => ({
    city: this.cityService.selectedCity()?.name,
    country: this.cityService.selectedCity()?.country,
    lat: this.cityService.selectedCity()?.lat,
    lon: this.cityService.selectedCity()?.lon,
  }));

  switchLang(lang: string): void {
    this.translocoService.setActiveLang(lang);
    this.currentLang.set(lang);
  }
}
