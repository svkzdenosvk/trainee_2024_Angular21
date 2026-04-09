
import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { FavouritesService } from '../../core/services/favourites.service';
import { CityService } from '../../core/services/city.service';
import { City } from '../../core/models/weather.model';
import { TranslocoModule } from '@jsverse/transloco';

@Component({
  selector: 'app-favourites',
  standalone: true,
  imports: [TranslocoModule],
  templateUrl: './favourites.html',
  styleUrls: ['./favourites.scss']
})
export class FavouritesComponent {
  protected readonly favouritesService = inject(FavouritesService);
  private readonly cityService = inject(CityService);
  private readonly router = inject(Router);

  selectCity(city: City): void {
    this.cityService.selectCity(city);
    this.router.navigate(['/weather'], {
      queryParams: {
        city: city.name,
        country: city.country,
        lat: city.lat,
        lon: city.lon
      }
    });
  }
}