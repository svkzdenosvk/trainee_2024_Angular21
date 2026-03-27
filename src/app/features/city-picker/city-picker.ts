import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Button } from 'primeng/button';
import { HttpClient } from '@angular/common/http';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { InputText } from 'primeng/inputtext';
import { ProgressSpinner } from 'primeng/progressspinner';
import { CityService } from '../../core/services/city.service';
import { FavouritesService } from '../../core/services/favourites.service';
import { City } from '../../core/models/weather.model';
import { CityMapComponent } from '../city-map/city-map';
import { SelectButton } from 'primeng/selectbutton';
import { FavouritesComponent } from '../favourites/favourites';

@Component({
  selector: 'app-city-picker',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    InputText,
    Button,
    ProgressSpinner,
    SelectButton,
    CityMapComponent,
    FavouritesComponent,
  ],
  templateUrl: './city-picker.html',
  styleUrls: ['./city-picker.scss'],
})
export class CityPickerComponent {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly cityService = inject(CityService);
  // public readonly favouritesService = inject(FavouritesService);
  protected readonly favouritesService = inject(FavouritesService);

  searchQuery = signal('');
  results = signal<City[]>([]);
  loading = signal(false);
  viewMode = signal<'search' | 'map' | 'favourites'>('search');

  modeOptions = [
    { label: '🔍 Search', value: 'search' },
    { label: '🗺️ Map', value: 'map' },
    { label: '⭐ Favorites', value: 'favourites' },
  ];
  private searchSubject = new Subject<string>();

  constructor() {
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
            `https://geocoding-api.open-meteo.com/v1/search?name=${query}&count=10&language=en&format=json`,
          );
        }),
      )
      .subscribe({
        next: (data: any) => {
          this.loading.set(false);
          if (data?.results) {
            this.results.set(
              data.results.map((r: any) => ({
                name: r.name,
                country: r.country,
                lat: r.latitude,
                lon: r.longitude,
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
      alert('Please select a city with a valid name');
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
      .some((fav) => fav.name === city.name && fav.country === city.country);
  }

  // toggleFavourite(city: City, event: Event): void {
  //   event.stopPropagation(); // Prevent triggering selectCity
  //   if (this.isFavourite(city)) {
  //     this.favouritesService.remove(city);
  //   } else {
  //     this.favouritesService.add(city);
  //   }
  // }

  toggleFavourite(city: City): void {
    if (this.favouritesService.isFavourite(city)) {
      this.favouritesService.remove(city);
    } else {
      this.favouritesService.add(city);
    }
  }
}
