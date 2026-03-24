// import { Component } from '@angular/core';

// @Component({
//   selector: 'app-app-shell',
//   imports: [],
//   templateUrl: './app-shell.html',
//   styleUrl: './app-shell.scss',
// })
// export class AppShell {

// }

import { Component, inject, computed } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CityService } from '../../../core/services/city.service';

@Component({
  selector: 'app-app-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app-shell.html',
  styleUrl: './app-shell.scss',
})
export class AppShell {
  protected readonly cityService = inject(CityService);

  protected readonly cityParams = computed(() => ({
    city: this.cityService.selectedCity()?.name,
    country: this.cityService.selectedCity()?.country,
    lat: this.cityService.selectedCity()?.lat,
    lon: this.cityService.selectedCity()?.lon
  }));
}