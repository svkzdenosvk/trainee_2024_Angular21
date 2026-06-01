import { Component, inject, signal, ChangeDetectionStrategy, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { InputText } from 'primeng/inputtext';
import { ProgressSpinner } from 'primeng/progressspinner';
import { CityService } from '../../core/services/city.service';
import { FavouritesService } from '../../core/services/favourites.service';
import { City } from '../../core/models/weather.model';
import { CityMapComponent } from '../city-map/city-map';
import { TranslocoModule } from '@jsverse/transloco';
import { AuthService } from '../../core/services/auth.service';
import { fadeInOut } from '../../shared/animations/animations';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { LangService } from '../../core/services/lang.service';

@Component({
  selector: 'app-city-picker',
  standalone: true,
  animations: [fadeInOut],
  imports: [
    CommonModule,
    FormsModule,
    InputText,
    ProgressSpinner,
    CityMapComponent,
    TranslocoModule,
  ],
  templateUrl: './city-picker.html',
  styleUrls: ['./city-picker.scss'],
  // changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CityPickerComponent {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly cityService = inject(CityService);
  protected readonly favouritesService = inject(FavouritesService);
  protected readonly authService = inject(AuthService);
  private readonly langService = inject(LangService);

  searchQuery = signal('');
  results = signal<City[]>([]);
  loading = signal(false);
  viewMode = signal<'search' | 'map'>('search');

  showFullWarning = signal(false);

  private searchSubject = new Subject<string>();

  constructor() {
    // delete results after language change
    effect(() => {
      this.langService.currentLang(); // dependency
      this.results.set([]);
      this.searchQuery.set('');
    });

    this.searchSubject
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((query) => {
          if (!query || query.length < 2) {
            this.results.set([]);
            return [];
          }
          this.loading.set(true);
          return this.http.get<any>(
            `https://geocoding-api.open-meteo.com/v1/search?name=${query}&count=10&language=${this.langService.currentLang()}&format=json`,
          );
        }),
        takeUntilDestroyed(),
      )
      .subscribe({
        next: (data: any) => {
          this.loading.set(false);
          if (data?.results) {
            this.results.set(
              data.results.map((r: any) => ({
                name: r.name,
                country: r.country,
                lat: Math.round(r.latitude * 100) / 100,
                lon: Math.round(r.longitude * 100) / 100,
              })),
            );
          } else {
            this.results.set([]);
          }
        },
        error: () => this.loading.set(false),
      });
  }

  onSearch(query: string): void {
    this.searchQuery.set(query);
    this.searchSubject.next(query);
  }

  selectCity(city: City): void {
    //small validation
    if (!city.name || !city.name.trim()) {
      alert('cityPicker.alert');
      return;
    }

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

  isFavourite(city: City): boolean {
    return this.favouritesService
      .favourites()
      .some(
        (fav) =>
          Math.round(fav.lat * 100) === Math.round(city.lat * 100) &&
          Math.round(fav.lon * 100) === Math.round(city.lon * 100),
      );
  }

  toggleFavourite(city: City, event: Event): void {
    event.stopPropagation();
    if (this.favouritesService.isFavourite(city)) {
      this.favouritesService.remove(city);
      this.showFullWarning.set(false);
    } else {
      if (this.favouritesService.isFull()) {
        this.showFullWarning.set(true);
        setTimeout(() => this.showFullWarning.set(false), 3500);
        return;
      }
      this.favouritesService.add(city);
    }
  }
}
