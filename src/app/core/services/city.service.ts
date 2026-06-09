import { Injectable, signal } from '@angular/core';
import { City } from '../models/weather.model';

@Injectable({ providedIn: 'root' })
export class CityService {
  // Selected city is stored as a signal so components can react to changes.
  selectedCity = signal<City | null>(null);

  selectCity(city: City): void {
    this.selectedCity.set(city);
  }

  // Try to create a City from URL query params and validate the coordinates.
  loadFromUrl(params: any): boolean {
    const lat = parseFloat(params.lat);
    const lon = parseFloat(params.lon);
    const name = params.city?.trim();
    const country = params.country?.trim() ?? '';

    if (!name) return false;
    if (isNaN(lat) || isNaN(lon)) return false;
    if (lat < -90 || lat > 90) return false;
    if (lon < -180 || lon > 180) return false;

    this.selectedCity.set({ name, country, lat, lon });
    return true;
  }

  // Clear the currently selected city from memory.
  clearCity(): void {
    this.selectedCity.set(null);
  }
}
