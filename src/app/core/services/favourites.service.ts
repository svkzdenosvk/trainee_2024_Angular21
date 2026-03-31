import { Injectable, signal, computed } from '@angular/core';
import { City } from '../models/weather.model';

const STORAGE_KEY = 'favourites';
const MAX_FAVOURITES = 10;

@Injectable({
  providedIn: 'root',
})
export class FavouritesService {
  favourites = signal<City[]>(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]'));

  readonly isFull = computed(() => this.favourites().length >= MAX_FAVOURITES);

  private sameCity(a: City, b: City): boolean {
    return (
      a.name.toLowerCase() === b.name.toLowerCase() &&
      a.country.toLowerCase() === b.country.toLowerCase() &&
      Math.round(a.lat * 10) === Math.round(b.lat * 10) &&
      Math.round(a.lon * 10) === Math.round(b.lon * 10)
    );
  }

  isFavourite(city: City): boolean {
    return this.favourites().some((f) => this.sameCity(f, city));
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
    const updated = this.favourites().filter((f) => !this.sameCity(f, city));
    this.favourites.set(updated);
    this.save();
  }

  update(city: City, newName: string): void {
    const updated = this.favourites().map((f: City) =>
      f.lat === city.lat && f.lon === city.lon ? { ...f, name: newName } : f,
    );
    this.favourites.set(updated);
    this.save();
  }

  private save(): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.favourites()));
  }
}
