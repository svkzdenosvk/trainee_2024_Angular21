import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { City, FavouriteResponse } from '../models/weather.model';
import { AuthService } from './auth.service';
import { API_URL } from '../constants/constants';

const MAX_FAVOURITES = 10;

@Injectable({ providedIn: 'root' })
export class FavouritesService {
  private readonly http = inject(HttpClient);

  private readonly authService = inject(AuthService);

  favourites = signal<City[]>([]);
  readonly isFull = computed(() => this.favourites().length >= MAX_FAVOURITES);

  reloadForUser(): void {
    if (!this.authService.isLoggedIn()) {
      this.favourites.set([]);
      return;
    }
    this.http.get<FavouriteResponse[]>(`${API_URL}/favourites`).subscribe({
      next: (data) => this.favourites.set(data),
      error: () => this.favourites.set([]),
    });
  }

  isFavourite(city: City): boolean {
    return this.favourites().some((f) => this.sameCity(f, city));
  }

  add(city: City): void {
      if (this.favourites().length >= 10) return;

    // if (this.isFull()) return;
    if (this.isFavourite(city)) return;
    if (!city.name?.trim() || !city.country?.trim()) return;

    // optimistic update - pridaj hneď do signalu
    // this.favourites.update((favs) => [...favs, city]);
     this.favourites.update(favs => [...favs, { ...city }]);

    this.http.post<FavouriteResponse>(`${API_URL}/favourites`, city).subscribe({
      next: () => this.reloadForUser(),
      error: () => this.reloadForUser(), // when error occurs, reload the correct state
    });
  }

  remove(city: City): void {
    console.log('favourites:', this.favourites());
    console.log('looking for:', city);
    const favourite = this.favourites().find((f) => this.sameCity(f, city)) as any;
    console.log('found:', favourite);
    if (!favourite?.id) return;

    this.http.delete(`${API_URL}/favourites/${favourite.id}`).subscribe({
      next: () => this.reloadForUser(),
      error: () => this.reloadForUser(), // when error occurs, reload the correct state
    });
  }

  private sameCity(a: City, b: City): boolean {
    return (
      a.name.toLowerCase() === b.name.toLowerCase() &&
      a.country.toLowerCase() === b.country.toLowerCase() &&
      Math.round(a.lat * 10) === Math.round(b.lat * 10) &&
      Math.round(a.lon * 10) === Math.round(b.lon * 10)
    );
  }
}
