import { Injectable } from '@angular/core';
import { HeatIndexEntry, TemperatureUnit } from '../models/weather.model';

const STORAGE_KEY = 'heatIndexHistory';
const MIN_TEMP_F = 80;
const HISTORY_LIMIT = 5;

@Injectable({ providedIn: 'root' })
export class HeatIndexService {

  // Rothfusz regression equation from https://www.weather.gov/media/epz/wxcalc/heatIndex.pdf
  calculateF(tempF: number, humidity: number): number | null {
    if (tempF < MIN_TEMP_F) return null;

    const T = tempF;
    const R = humidity;

    let HI =
      -42.379
      + 2.04901523 * T
      + 10.14333127 * R
      - 0.22475541 * T * R
      - 0.00683783 * T * T
      - 0.05481717 * R * R
      + 0.00122874 * T * T * R
      + 0.00085282 * T * R * R
      - 0.00000199 * T * T * R * R;

    // Adjustment for low humidity
    if (R < 13 && T >= 80 && T <= 112) {
      HI -= ((13 - R) / 4) * Math.sqrt((17 - Math.abs(T - 95)) / 17);
    }

    // Adjustment for high humidity
    if (R > 85 && T >= 80 && T <= 87) {
      HI += ((R - 85) / 10) * ((87 - T) / 5);
    }

    return HI;
  }

  // Calculate heat index for the provided temperature/humidity using selected units.
  calculate(temp: number, humidity: number, unit: TemperatureUnit): number | null {
    const tempF = unit === '°C' ? this.toFahrenheit(temp) : temp;
    const hiF = this.calculateF(tempF, humidity);
    if (hiF === null) return null;
    return unit === '°C' ? this.toCelsius(hiF) : hiF;
  }

  toFahrenheit(celsius: number): number {
    return (celsius * 9) / 5 + 32;
  }

  toCelsius(fahrenheit: number): number {
    return ((fahrenheit - 32) * 5) / 9;
  }

  getMinTemp(unit: TemperatureUnit): number {
    return unit === '°C' ? 26.7 : 80;
  }

  // Persist the latest heat index calculation in localStorage.
  saveToHistory(entry: HeatIndexEntry): HeatIndexEntry[] {
    const history = this.loadHistory();
    const updated = [entry, ...history].slice(0, HISTORY_LIMIT);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  }

  // Load persisted heat index history and restore timestamp objects.
  loadHistory(): HeatIndexEntry[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      return JSON.parse(raw).map((e: HeatIndexEntry) => ({
        ...e,
        timestamp: new Date(e.timestamp)
      }));
    } catch {
      return [];
    }
  }

  // Clear stored heat index history from localStorage.
  clearHistory(): void {
    localStorage.removeItem(STORAGE_KEY);
  }
}
