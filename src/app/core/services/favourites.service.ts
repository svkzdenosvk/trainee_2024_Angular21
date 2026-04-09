import { Injectable, signal, computed, inject } from '@angular/core';
import { City } from '../models/weather.model';
import { AuthService } from './auth.service';

const MAX_FAVOURITES = 10;

@Injectable({ providedIn: 'root' })
export class FavouritesService {
  private readonly authService = inject(AuthService);

  private getStorageKey(): string {
    const userId = this.authService.currentUser()?.id;
    return userId ? `favourites_${userId}` : 'favourites_guest';
  }

  favourites = signal<City[]>(this.loadFromStorage());

  readonly isFull = computed(() => this.favourites().length >= MAX_FAVOURITES);

  private loadFromStorage(): City[] {
    return JSON.parse(localStorage.getItem(this.getStorageKey()) ?? '[]');
  }

  isFavourite(city: City): boolean {
    return this.favourites().some(f => this.sameCity(f, city));
  }

  add(city: City): void {
    if (this.isFull()) return;
    if (this.isFavourite(city)) return;
    if (!city.name?.trim() || !city.country?.trim()) return;
    const updated = [...this.favourites(), city];
    this.favourites.set(updated);
    this.save();
  }

  remove(city: City): void {
    const updated = this.favourites().filter(f => !this.sameCity(f, city));
    this.favourites.set(updated);
    this.save();
  }

  update(city: City, newName: string): void {
    const updated = this.favourites().map((f: City) =>
      this.sameCity(f, city) ? { ...f, name: newName } : f
    );
    this.favourites.set(updated);
    this.save();
  }

  // Called after login to reload favourites for logged in user
  reloadForUser(): void {
    this.favourites.set(this.loadFromStorage());
  }

  private save(): void {
    localStorage.setItem(this.getStorageKey(), JSON.stringify(this.favourites()));
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