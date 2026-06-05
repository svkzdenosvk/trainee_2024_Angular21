import { Component, inject, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Store } from '@ngrx/store';
import { Router } from '@angular/router';
import { CityService } from '../../core/services/city.service';
import { City } from '../../core/models/weather.model';
import { TranslocoModule } from '@jsverse/transloco';
import { trigger, transition, style, animate, query, stagger } from '@angular/animations';
import { FavouritesActions } from '../../store/favourites/favourites.actions';
import { selectAllFavourites, selectIsFull } from '../../store/favourites/favourites.selectors';
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
  private readonly store = inject(Store);
  private readonly cityService = inject(CityService);
  private readonly router = inject(Router);

  favourites = this.store.selectSignal(selectAllFavourites);
  isFull = this.store.selectSignal(selectIsFull);

  ngOnInit(): void {
    this.store.dispatch(FavouritesActions.loadFavourites());
  }
  remove(city: City): void {
    this.store.dispatch(FavouritesActions.removeFavourite({ city }));
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
