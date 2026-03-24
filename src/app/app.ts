import { Component, inject, computed } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
// import { CityService } from './core/services/city.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  // templateUrl: './app.html',
  template: `<router-outlet />`,
  // styleUrls: ['./app.scss'],
  styleUrls: [],

})
export class App {
  // protected cityService = inject(CityService);

  // protected readonly cityParams = computed(() => ({
  //   city: this.cityService.selectedCity()?.name,
  //   country: this.cityService.selectedCity()?.country,
  //   lat: this.cityService.selectedCity()?.lat,
  //   lon: this.cityService.selectedCity()?.lon,
  // }));
}
