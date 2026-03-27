import { Injectable, signal, computed } from '@angular/core';
import { City } from '../models/weather.model';

const STORAGE_KEY = 'favourites';
const MAX_FAVOURITES = 10;

@Injectable({
  providedIn: 'root',
})
export class FavouritesService {
  favourites = signal<City[]>(
    JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
  );

  readonly isFull = computed(() => this.favourites().length >= MAX_FAVOURITES);

  isFavourite(city: City): boolean {
    return this.favourites().some(f => f.lat === city.lat && f.lon === city.lon);
  }

  add(city: City): void {
    if (this.isFull()) return;
    if (this.isFavourite(city)) return;
    const updated = [...this.favourites(), city];
    this.favourites.set(updated);
    this.save();
  }

  remove(city: City): void {
    const updated = this.favourites().filter(
      f => f.lat !== city.lat || f.lon !== city.lon
    );
    this.favourites.set(updated);
    this.save();
  }

  update(city: City, newName: string): void {
    const updated = this.favourites().map((f: City) =>
      f.lat === city.lat && f.lon === city.lon
        ? { ...f, name: newName }
        : f
    );
    this.favourites.set(updated);
    this.save();
  }

  private save(): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.favourites()));
  }
}