import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { WeatherApiResponse, WeatherRow } from '../models/weather.model';
import { CityService } from './city.service';
import { TranslocoService } from '@jsverse/transloco';

@Injectable({ providedIn: 'root' })
export class WeatherService {
  private readonly http = inject(HttpClient);
  private readonly cityService = inject(CityService);
  private readonly translocoService = inject(TranslocoService);
  private readonly API_URL = 'https://api.open-meteo.com/v1/forecast';

  // Fetch hourly weather forecast data for the currently selected city.
  getWeatherData(startDate: string, endDate: string): Observable<WeatherRow[]> {
    const city = this.cityService.selectedCity();

    const params = new HttpParams()
      .set('latitude', city!.lat)
      .set('longitude', city!.lon)
      .set(
        'hourly',
        'temperature_2m,relativehumidity_2m,surface_pressure,weathercode,windspeed_10m,precipitation',
      )
      .set('start_date', startDate)
      .set('end_date', endDate)
      .set('timezone', 'auto');

    return this.http
      .get<WeatherApiResponse>(this.API_URL, { params })
      .pipe(map((response) => this.transformResponse(response)));
  }

  // Convert the raw API payload into a UI-friendly WeatherRow array.
  private transformResponse(response: WeatherApiResponse): WeatherRow[] {
    return response.hourly.time.map((time, i) => {
      const weatherState = this.getWeatherState(response.hourly.weathercode[i]);
      return {
        datetime: new Date(time),
        weatherState,
        weatherStateLabel: this.translocoService.translate(weatherState),
        weatherIcon: this.getWeatherIcon(response.hourly.weathercode[i]),
        temperature: response.hourly.temperature_2m[i],
        humidity: response.hourly.relativehumidity_2m[i],
        pressure: response.hourly.surface_pressure[i],
        windSpeed: response.hourly.windspeed_10m[i],
        precipitation: response.hourly.precipitation[i],
      };
    });
  }

  private getWeatherState(code: number): string {
    if (code === 0) return 'weather.states.clearSky';
    if (code <= 2) return 'weather.states.partlyCloudy';
    if (code === 3) return 'weather.states.overcast';
    if (code <= 49) return 'weather.states.foggy';
    if (code <= 59) return 'weather.states.drizzle';
    if (code <= 69) return 'weather.states.rain';
    if (code <= 79) return 'weather.states.snow';
    if (code <= 82) return 'weather.states.rainShowers';
    if (code <= 86) return 'weather.states.snowShowers';
    if (code <= 99) return 'weather.states.thunderstorm';
    return 'weather.states.unknown';
  }

  private getWeatherIcon(code: number): string {
    if (code === 0) return 'pi-sun';
    if (code <= 2) return 'pi-cloud';
    if (code === 3) return 'pi-cloud';
    if (code <= 49) return 'pi-eye-slash';
    if (code <= 69) return 'pi-cloud';
    if (code <= 79) return 'pi-cloud';
    if (code <= 99) return 'pi-bolt';
    return 'pi-question';
  }

  formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  getDefaultDateRange(): { start: Date; end: Date } {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 7);
    return { start, end };
  }

  getForecastDateRange(): { start: Date; end: Date } {
    const start = new Date();
    const end = new Date();
    end.setDate(end.getDate() + 7);
    return { start, end };
  }

  // Validate that the selected date range is present and not longer than the allowed maximum.
  validateDateRange(range: Date[]): string | null {
    if (!range || !Array.isArray(range) || range.length < 2 || !range[1]) {
      return 'weather.errorValidRange';
    }
    const diffDays = Math.round((range[1].getTime() - range[0].getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays > 90) {
      return 'weather.errorRange';
    }
    return null;
  }
}
