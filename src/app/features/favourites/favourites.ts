import { Component, inject, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { FavouritesService } from '../../core/services/favourites.service';
import { CityService } from '../../core/services/city.service';
import { City } from '../../core/models/weather.model';
import { TranslocoModule } from '@jsverse/transloco';
import { trigger, transition, style, animate, query, stagger } from '@angular/animations';

@Component({
  animations: [
    trigger('listAnimation', [
      transition('* => *', [
        query(
          ':enter',
          [
            style({ opacity: 0, transform: 'translateX(-10px)' }),
            stagger('60ms', [
              animate('200ms ease-out', style({ opacity: 1, transform: 'translateX(0)' })),
            ]),
          ],
          { optional: true },
        ),
        query(
          ':leave',
          [animate('150ms ease-in', style({ opacity: 0, transform: 'translateX(10px)' }))],
          { optional: true },
        ),
      ]),
    ]),
  ],
  selector: 'app-favourites',
  standalone: true,
  imports: [TranslocoModule],
  templateUrl: './favourites.html',
  styleUrls: ['./favourites.scss'],
  // changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FavouritesComponent implements OnInit {
  protected readonly favouritesService = inject(FavouritesService);
  private readonly cityService = inject(CityService);
  private readonly router = inject(Router);

  ngOnInit(): void {
    this.favouritesService.reloadForUser();
  }

  selectCity(city: City): void {
    this.cityService.selectCity(city);
    this.router.navigate(['/weather'], {
      queryParams: {
        city: city.name,
        country: city.country,
        lat: city.lat,
        lon: city.lon,
      },
    });
  }
}
