import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { WeatherApiResponse, WeatherRow } from '../models/weather.model';

@Injectable({ providedIn: 'root' })
export class WeatherService {
  private readonly http = inject(HttpClient);
  private readonly API_URL = 'https://api.open-meteo.com/v1/forecast';
  private readonly LAT = 51.5074;
  private readonly LON = -0.1278;

  getWeatherData(startDate: string, endDate: string): Observable<WeatherRow[]> {
    const params = new HttpParams()
      .set('latitude', this.LAT)
      .set('longitude', this.LON)
      .set('hourly', 'temperature_2m,relativehumidity_2m,surface_pressure,weathercode,windspeed_10m,precipitation')
      .set('start_date', startDate)
      .set('end_date', endDate)
      .set('timezone', 'Europe/London');

    return this.http
      .get<WeatherApiResponse>(this.API_URL, { params })
      .pipe(map(response => this.transformResponse(response)));
  }

  private transformResponse(response: WeatherApiResponse): WeatherRow[] {
    return response.hourly.time.map((time, i) => ({
      datetime: new Date(time),
      weatherState: this.getWeatherState(response.hourly.weathercode[i]),
      weatherIcon: this.getWeatherIcon(response.hourly.weathercode[i]),
      temperature: response.hourly.temperature_2m[i],
      humidity: response.hourly.relativehumidity_2m[i],
      pressure: response.hourly.surface_pressure[i],
      windSpeed: response.hourly.windspeed_10m[i],
      precipitation: response.hourly.precipitation[i]
    }));
  }

  private getWeatherState(code: number): string {
    if (code === 0) return 'Clear Sky';
    if (code <= 2) return 'Partly Cloudy';
    if (code === 3) return 'Overcast';
    if (code <= 49) return 'Foggy';
    if (code <= 59) return 'Drizzle';
    if (code <= 69) return 'Rain';
    if (code <= 79) return 'Snow';
    if (code <= 82) return 'Rain Showers';
    if (code <= 86) return 'Snow Showers';
    if (code <= 99) return 'Thunderstorm';
    return 'Unknown';
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
}
