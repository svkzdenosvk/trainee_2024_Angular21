import { Injectable, signal } from '@angular/core';
import { City } from '../models/weather.model';

@Injectable({ providedIn: 'root' })
export class CityService {
  selectedCity = signal<City | null>(null);

  selectCity(city: City): void {
    this.selectedCity.set(city);
  }

  clearCity(): void {
    this.selectedCity.set(null);
  }
}